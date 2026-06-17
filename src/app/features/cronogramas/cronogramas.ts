import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CronogramaService, Cronograma } from '../../core/services/cronograma.service';

@Component({
  selector: 'app-cronogramas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cronogramas.html'
})
export class CronogramasComponent implements OnInit {
  cronogramas: Cronograma[] = [];
  form: FormGroup;
  editingId: number | null = null;
  showModal = false;

  constructor(
    private cronogramaService: CronogramaService, 
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      filas: this.fb.array([])
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarCronogramas();
    }
  }

  cargarCronogramas() {
    this.cronogramaService.listar().subscribe({
      next: (data) => this.cronogramas = data,
      error: (err) => console.error('Error cargando cronogramas', err)
    });
  }

  getCantidadMercados(jsonStr: string): number {
    try {
      const arr = JSON.parse(jsonStr);
      return Array.isArray(arr) ? arr.length : 0;
    } catch(e) {
      return 0;
    }
  }

  get filas() {
    return this.form.get('filas') as FormArray;
  }

  agregarFila() {
    this.filas.push(this.fb.group({
      Ciudad: ['', Validators.required],
      MERCADO: ['', Validators.required],
      DEX: ['', Validators.required]
    }));
  }

  eliminarFila(index: number) {
    this.filas.removeAt(index);
  }

  abrirModalNuevo() {
    this.editingId = null;
    this.form.reset({ nombre: '' });
    this.filas.clear();
    this.agregarFila(); // Una fila por defecto
    this.showModal = true;
  }

  editarCronograma(crono: Cronograma) {
    this.editingId = crono.id!;
    this.form.reset({ nombre: crono.nombre });
    this.filas.clear();
    
    let datos = [];
    try {
      datos = JSON.parse(crono.datosJson);
    } catch(e) {}
    
    if (datos.length === 0) {
      this.agregarFila();
    } else {
      datos.forEach((fila: any) => {
        this.filas.push(this.fb.group({
          Ciudad: [fila.Ciudad || '', Validators.required],
          MERCADO: [fila.MERCADO || '', Validators.required],
          DEX: [fila.DEX || '', Validators.required]
        }));
      });
    }
    this.showModal = true;
  }

  eliminarCronograma(id: number) {
    if (confirm('¿Seguro que desea eliminar este cronograma?')) {
      this.cronogramaService.eliminar(id).subscribe({
        next: () => this.cargarCronogramas(),
        error: (err: any) => alert('Error eliminando: ' + err.message)
      });
    }
  }

  guardar() {
    if (this.form.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const value = this.form.value;
    const nuevo: Cronograma = {
      nombre: value.nombre,
      datosJson: JSON.stringify(value.filas)
    };

    if (this.editingId) {
      this.cronogramaService.actualizar(this.editingId, nuevo).subscribe({
        next: () => {
          this.showModal = false;
          this.cargarCronogramas();
        },
        error: (err: any) => alert('Error: ' + err.message)
      });
    } else {
      this.cronogramaService.guardar(nuevo).subscribe({
        next: () => {
          this.showModal = false;
          this.cargarCronogramas();
        },
        error: (err: any) => alert('Error: ' + err.message)
      });
    }
  }

  cerrarModal() {
    this.showModal = false;
  }
}
