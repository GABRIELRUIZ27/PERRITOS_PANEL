import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { LoadingStates } from 'src/app/global/global';

import { Perritos } from 'src/app/models/perritos';
import * as XLSX from 'xlsx';
import { PerritosService } from 'src/app/core/services/perritos.service';
import { Adopciones } from 'src/app/models/adopcion';
import { AdopcionService } from 'src/app/core/services/adopcion.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-perritos',
  templateUrl: './adopcion.component.html',
  styleUrls: ['./adopcion.component.css']
})
export class AdopcionComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  adopcion!: Adopciones;
  adopcionForm!: FormGroup;
  perritos: Perritos[] = [];
  isLoading = LoadingStates.neutro;
  adopciones: Adopciones[] = [];
  adopcionFilter: Adopciones[] = [];
  isModalAdd = true;
  imagenAmpliada: string | null = null;
  mostrarModal = false;

  public imgPreview: string = '';
  public isUpdatingImg: boolean = false;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private perritosService: PerritosService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private adopcionService: AdopcionService,
    private datePipe: DatePipe,
  ) {
    this.createForm();
    this.adopcionService.refreshListAdopciones.subscribe(() => this.getAdopciones());
    this.getPerritos();
    this.getAdopciones();
  }

  obtenerNombreMes(fecha: string | null): string {
    if (fecha === null) {
      return '';
    }
    
    const fechaObj = new Date(fecha);
    const numeroMes = fechaObj.getMonth(); // El método getMonth() devuelve el número de mes (0-11)
    
    // Diccionario de nombres de meses en español
    const nombresMeses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    // Obtener el nombre del mes en base al número
    const nombreMes = nombresMeses[numeroMes];
    
    return nombreMes || '';
  }
  
  getPerritos() {
    this.isLoading = LoadingStates.trueLoading;
    this.perritosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.perritos = dataFromAPI.filter(perrito => {
          // Filtrar los perritos que no han sido adoptados
          return !this.adopciones.some(adopcion => adopcion.perrito.id === perrito.id);
        });
        console.log('Perritos no adoptados:', this.perritos);
        this.isLoading = LoadingStates.falseLoading;
      },
      error: (error) => {
        console.error(error);
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  getAdopciones() {
    this.isLoading = LoadingStates.trueLoading;
    this.adopcionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.adopciones = dataFromAPI;
        console.log('Adopciones:', this.adopciones);
        this.adopcionFilter = this.adopciones; // Inicializa adopcionFilter con todos los datos al principio
        this.isLoading = LoadingStates.falseLoading;
        this.getPerritos(); // Llamar a getPerritos después de obtener las adopciones
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }  

  createForm() {
    this.adopcionForm = this.formBuilder.group({
      id: [null],
      fechaAdopcion: [
        '',
        [
          Validators.required,
        ],
      ],
      imagenBase64: [''],
      perritos: [null, Validators.required],
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    this.adopcionForm.get('esterilizado')?.setValue(true);

    const inputValue = event.target.value.toLowerCase();
    this.adopcionFilter = this.adopciones.filter(
      (perrito) =>
        perrito.perrito.nombre
          .toLocaleLowerCase()
          .includes(inputValue.toLowerCase()) ||
        perrito.fechaAdopcion
          .toLocaleLowerCase()
          .includes(inputValue.toLowerCase()) 
    );
    this.configPaginator.currentPage = 1;
    if (this.adopcionForm) {
      this.adopcionForm.reset();
      this.isModalAdd = true;
    }
  }

  id!: number;
  formData: any;

  setDataModalUpdate(dto: Adopciones) {
    this.isModalAdd = false;
    this.id = dto.id;

    const adopcion = this.adopcionFilter.find(
      (adopcion) => adopcion.id === dto.id
    );

    console.log('setModalUpdateDTO: ', dto);

    this.imgPreview = adopcion!.imagen;
    this.isUpdatingImg = true;

    this.adopcionForm.patchValue({
      id: dto.id,
      perrito: dto.perrito.id,
      fechaAdopcion: dto.fechaAdopcion,
      imagenBase64: '',
    });

    // El objeto que se enviará al editar la visita será directamente this.visitaForm.value
    console.log('setDataUpdateVistaForm ', this.adopcionForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  deleteItem(id: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la adopcion?`,
      () => {
        this.adopcionService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Adopcion borrada correctamente');
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
    this.adopcionForm.reset();
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
    this.adopcion = this.adopcionForm.value as Adopciones;
    const perritoId = this.adopcionForm.get('perritos')?.value;

    this.adopcion.perrito = { id: perritoId } as Perritos;

    this.spinnerService.show();
    console.log('data:', this.adopcion);
    const imagenBase64 = this.adopcionForm.get('imagenBase64')?.value;

    const formData = { ...this.adopcion, imagenBase64 };

    this.spinnerService.show();
    this.adopcionService.post(formData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Adopcion guardada correctamente');
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
    this.adopcion = this.adopcionForm.value as Adopciones;

    const adopcionId = this.adopcionForm.get('id')?.value;
    const perritoId = this.adopcionForm.get('perrito')?.value;
    const imagenBase64 = this.adopcionForm.get('imagenBase64')?.value;

    this.imgPreview = '';

    this.adopcion.perrito = { id: perritoId } as Perritos;

    if (!imagenBase64) {
      const formData = { ...this.adopcion };

      this.spinnerService.show();

      this.adopcionService.put(adopcionId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Visita actualizada correctamente');
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else if (imagenBase64) {
      const formData = { ...this.adopcion, imagenBase64 };
      this.spinnerService.show();

      this.adopcionService.put(adopcionId, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito('Adopcion actualizada correctamente');
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
    this.adopcionForm.reset();
    this.isModalAdd = true;
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

        this.adopcionForm.patchValue({
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





