import { Component, computed, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { EquipoComercial } from '../../core/models/equipo-comercial.model';

@Component({
  selector: 'app-equipos',
  imports: [FormsModule],
  templateUrl: './equipos.html',
  styleUrl: './equipos.css'
})
export class EquiposComercialesComponent implements OnInit {
  filter = signal('');
  showModal = signal(false);

  currentEquipo: EquipoComercial = { nombre: '', descripcion: '' };

  filteredEquipos = computed(() => {
    const term = this.filter().toLowerCase();
    return this.dataService.equipos().filter(eq => 
      eq.nombre.toLowerCase().includes(term) || 
      (eq.descripcion && eq.descripcion.toLowerCase().includes(term))
    );
  });

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadModuleData('equipos');
  }

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  openNewEquipoModal() {
    this.currentEquipo = { nombre: '', descripcion: '' };
    this.showModal.set(true);
  }

  editEquipo(eq: EquipoComercial) {
    this.currentEquipo = { ...eq };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveEquipo() {
    if (!this.currentEquipo.nombre.trim()) {
      this.dataService.showNotification('El nombre del equipo es obligatorio', 'error');
      return;
    }

    if (this.currentEquipo.equipoId) {
      this.dataService.updateEquipo(this.currentEquipo.equipoId, this.currentEquipo);
    } else {
      this.dataService.addEquipo(this.currentEquipo);
    }
    this.closeModal();
  }

  deleteEquipo(id: number) {
    if (confirm('¿Estás seguro que deseas eliminar permanentemente este equipo comercial?')) {
      this.dataService.deleteEquipo(id);
      this.closeModal();
    }
  }
}
