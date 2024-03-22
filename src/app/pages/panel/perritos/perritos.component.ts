import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';
import { Discapacidad } from 'src/app/models/discapacidad';
import { DiscapacidadService } from 'src/app/core/services/discapacidad.service';

import { Perritos } from 'src/app/models/perritos';
import * as XLSX from 'xlsx';
import { PerritosService } from 'src/app/core/services/perritos.service';
import { Genero } from 'src/app/models/genero';
import { GeneroService } from 'src/app/core/services/generos.service';
import { Edad } from 'src/app/models/edad';
import { EdadService } from 'src/app/core/services/edad.service';
import { Tamaño } from 'src/app/models/tamaño';
import { TamañoService } from 'src/app/core/services/tamaño.service';
@Component({
  selector: 'app-perritos',
  templateUrl: './perritos.component.html',
  styleUrls: ['./perritos.component.css']
})
export class PerritosComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  perrito!: Perritos;
  perritoForm!: FormGroup;
  perritos: Perritos[] = [];
  perritosFilter: Perritos[] = [];
  isLoading = LoadingStates.neutro;
  genero: Genero[] = [];
  discapacidad: Discapacidad[] = [];
  tamano: Tamaño [] = [];
  edad: Edad [] = [];
  isModalAdd = true;
  imagenAmpliada: string | null = null;
  mostrarModal = false;

  public imgPreview: string = '';
  public isUpdatingImg: boolean = false;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private perritosService: PerritosService,
    private generoService: GeneroService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private discapacidadService: DiscapacidadService,
    private tamañoService: TamañoService,
    private edadService: EdadService,

  ) {
    this.createForm();
    this.perritosService.refreshListPerritos.subscribe(() => this.getPerritos());
    this.getPerritos();
    this.getDiscapacidades();
    this.getGenero();
    this.getEdad();
    this.getTamaño();

  }

  getGenero() {
    this.generoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.genero = dataFromAPI;
        console.log('Género', this.genero);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getTamaño() {
    this.tamañoService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.tamano = dataFromAPI;
        console.log('Tamaño', this.tamano);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getEdad() {
    this.edadService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.edad = dataFromAPI;
        console.log('Edad', this.edad);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getDiscapacidades() {
    this.discapacidadService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.discapacidad = dataFromAPI;
        console.log('Discapacidades', this.discapacidad);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  getPerritos() {
    this.isLoading = LoadingStates.trueLoading;
    this.perritosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.perritos = dataFromAPI;
        this.perritosFilter = this.perritos;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  createForm() {
    this.perritoForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      imagenBase64: [''],
      genero: [null, Validators.required],
      edad: [null, Validators.required],
      discapacidad: [null],
      esterilizado: [true],
      tamano: [null, Validators.required],
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    this.perritoForm.get('esterilizado')?.setValue(true);

    const inputValue = event.target.value.toLowerCase();
    this.perritosFilter = this.perritos.filter(
      (perrito) =>
        perrito.nombre
          .toLocaleLowerCase()
          .includes(inputValue.toLowerCase()) ||
        perrito.discapacidad.nombre
          .toLocaleLowerCase()
          .includes(inputValue.toLowerCase()) ||
        perrito.genero.nombre
          .toLocaleLowerCase()
          .includes(inputValue.toLowerCase()) 
    );
    this.configPaginator.currentPage = 1;
    if (this.perritoForm) {
      this.perritoForm.reset();
      const estatusControl = this.perritoForm.get('esterilizado');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  id!: number;
  formData: any;

  setDataModalUpdate(dto: Perritos) {
    this.isModalAdd = false;
    this.id = dto.id;

    const perrito = this.perritosFilter.find(
      (perrito) => perrito.id === dto.id
    );

    console.log('setModalUpdateDTO: ', dto);

    this.imgPreview = perrito!.imagen;
    this.isUpdatingImg = true;

    this.perritoForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      esterilizado: dto.esterelizado,
      discapacidad: dto.discapacidad.id,
      imagenBase64: '',
      tamano: dto.tamaño.id,
      edad: dto.edad.id
    });

    // El objeto que se enviará al editar la visita será directamente this.visitaForm.value
    console.log('setDataUpdateVistaForm ', this.perritoForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el perrito: ${nameItem}?`,
      () => {
        this.perritosService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Perrito borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.perritoForm.reset();
  }

  isUpdating: boolean = false;

  submit() {
    if (this.isModalAdd === false) {
      this.actualizarVisita();
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.perrito = this.perritoForm.value as Perritos;
    const discapacidadId = this.perritoForm.get('discapacidad')?.value;
    const generoId = this.perritoForm.get('genero')?.value;
    const tamañoId = this.perritoForm.get('tamano')?.value;
    const edadId = this.perritoForm.get('edad')?.value;

    this.perrito.discapacidad = { id: discapacidadId } as Discapacidad;
    this.perrito.genero = { id: generoId } as Genero;
    this.perrito.tamaño = { id: tamañoId } as Tamaño;
    this.perrito.edad = { id: edadId } as Edad;

    this.spinnerService.show();
    console.log('data:', this.perrito);
    const imagenBase64 = this.perritoForm.get('imagenBase64')?.value;

    const formData = { ...this.perrito, imagenBase64 };

    this.spinnerService.show();
    this.perritosService.post(formData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Perrito guardado correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  actualizarVisita() {
    this.perrito = this.perritoForm.value as Perritos;

    const visitaId = this.perritoForm.get('id')?.value;
    const votanteId = this.perritoForm.get('simpatizante')?.value;
    const imagenBase64 = this.perritoForm.get('imagenBase64')?.value;

    this.imgPreview = '';

    this.perrito.discapacidad = { id: votanteId } as Discapacidad;

    if (!imagenBase64) {
      const formData = { ...this.perrito };

      this.spinnerService.show();

      this.perritosService.put(visitaId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Perrito actualizada correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else if (imagenBase64) {
      const formData = { ...this.perrito, imagenBase64 };
      this.spinnerService.show();

      this.perritosService.put(visitaId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Perrito actualizado correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      console.error(
        'Error: No se encontró una representación válida en base64 de la imagen.'
      );
    }
  }

  handleChangeAdd() {
    this.isUpdatingImg = false;
    this.perritoForm.reset();
    this.isModalAdd = true;
    const estatusControl = this.perritoForm.get('simpatiza');
    if (estatusControl) {
      estatusControl.setValue(true);
    }
  }

  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.isUpdatingImg = false;

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.perritoForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };

      reader.readAsDataURL(file);
    }
  }

  readFileAsDataURL(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al leer el archivo como URL de datos.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo.'));
      };

      reader.readAsDataURL(new Blob([filePath]));
    });
  }

  obtenerRutaImagen(nombreArchivo: string): string {
    const rutaBaseAPI = 'https://localhost:7224/';
    if (nombreArchivo) {
      return `${rutaBaseAPI}images/${nombreArchivo}`;
    }
    return ''; // O una URL predeterminada si no hay nombre de archivo
  }

  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  exportarDatosAExcel() {
    if (this.perritos.length === 0) {
      console.warn('La lista de visitas está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.perritos.map((perrito) => {
      return {
        'Nombre': perrito.nombre,
        Discapacidad: perrito.discapacidad.nombre,
      };
    });

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarArchivoExcel(excelBuffer, 'visitas.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}





