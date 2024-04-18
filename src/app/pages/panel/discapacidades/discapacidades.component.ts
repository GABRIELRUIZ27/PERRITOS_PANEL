import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Discapacidad } from 'src/app/models/discapacidad';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { DiscapacidadService } from 'src/app/core/services/discapacidad.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-discapacidades',
  templateUrl: './discapacidades.component.html',
  styleUrls: ['./discapacidades.component.css']
})
export class DiscapacidadesComponent {

  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  discapacidades!: Discapacidad;
  discapacidadForm!: FormGroup;
  busqueda!: FormGroup;
  discapacidad: Discapacidad[] = [];
  discapacidadFilter: Discapacidad[] = [];
  isLoading = LoadingStates.neutro;

  isModalAdd: boolean = true;
  formData: any;
  rolId = 0;
  defaultColor = '#206bc4';
  id!: number;
  estatusBtn = true;
  verdadero = "Activo";
  falso = "Inactivo";
  estatusTag = this.verdadero;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private discapacidadService: DiscapacidadService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
  ) {
    this.discapacidadService.refreshListDiscapacidades.subscribe(() => this.getDiscapacidad());
    this.getDiscapacidad();
    this.creteForm();
  }


  creteForm() {
    this.discapacidadForm = this.formBuilder.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/)]],
    });
  }



  getDiscapacidad() {
    this.isLoading = LoadingStates.trueLoading;
    this.discapacidadService.getAll().subscribe(
      {
        next: (dataFromAPI) => {
          this.discapacidad = dataFromAPI;
          this.discapacidadFilter = this.discapacidad;
          this.isLoading = LoadingStates.falseLoading;
        },
        error: () => {
          this.isLoading = LoadingStates.errorLoading
        }
      }
    );
  }


  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.discapacidadFilter = this.discapacidad.filter(discapacidad =>
      discapacidad.nombre.toLowerCase().includes(valueSearch) ||
      discapacidad.id.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }


  actualizar() {
    const programaSocialData = { ...this.discapacidadForm.value };
    this.discapacidades = programaSocialData as Discapacidad;
    this.spinnerService.show();
    this.discapacidadService.put(this.id, this.discapacidades).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito("Discapacidad actualizada con éxito");
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.mensajeService.mensajeError("Error al actualizar la discapacidad");
        console.error(error);
      }
    });
  }


  setDataModalUpdate(dto: Discapacidad) {
    this.isModalAdd = false;
    this.id = dto.id;
    this.discapacidadForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
    });
    this.formData = this.discapacidadForm.value;
    console.log(dto)

  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar la discapacidad: ${nameItem}?`,
      () => {
        this.discapacidadService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Discapacidad borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error)
        });
      }
    );
  }


  resetForm() {
    this.closebutton.nativeElement.click();
    this.discapacidadForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {

      this.actualizar();
    } else {
      this.agregar();

    }
  }


  agregar() {
    const programaSocialData = { ...this.discapacidadForm.value };
    delete programaSocialData.id;
    this.discapacidades = programaSocialData as Discapacidad;
    this.spinnerService.show();
    this.discapacidadService.post(this.discapacidades).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Discapacidad guardada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      }
    });
  }

  handleChangeAdd() {
    if (this.discapacidadForm) {
      this.discapacidadForm.reset();
      const estatusControl = this.discapacidadForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }


  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }

  exportarDatosAExcel() {
    if (this.discapacidad.length === 0) {
      console.warn('La lista de discapacidades está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.discapacidad.map(discapacidades => {

      return {
        'Id': discapacidades.id,
        'Nombre': discapacidades.nombre,
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    this.guardarArchivoExcel(excelBuffer, 'discapacidades.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  toggleEstatus() {
    const estatusControl = this.discapacidadForm.get('Estatus');

    if (estatusControl) {
      estatusControl.setValue(estatusControl.value === 1 ? 0 : 1);
    }
  }

  buscar: string = '';
  beneficiarioFiltrado: any[] = [];

  filtrarBeneficiario(): any {
    return this.discapacidad.filter(discapacidades =>
      discapacidades.nombre.toLowerCase().includes(this.buscar.toLowerCase(),)
    );

  }
  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.beneficiarioFiltrado = this.filtrarBeneficiario();
  }


}

