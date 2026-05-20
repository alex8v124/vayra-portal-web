import { Component, computed, signal } from '@angular/core';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-skus',
  imports: [],
  templateUrl: './skus.html',
  styleUrl: './skus.css'
})
export class SkusComponent {
  filter = signal('');
  showModal = signal(false);

  filteredSKUs = computed(() => {
    const term = this.filter().toLowerCase();
    return this.dataService.skus().filter(s => s.nombre.toLowerCase().includes(term));
  });

  constructor(public dataService: DataService) {}

  updateFilter(event: Event) {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  toggleSKU(id: number, event: Event) {
    const active = (event.target as HTMLInputElement).checked;
    const sku = this.dataService.skus().find(x => x.id === id);
    if(sku) {
      this.dataService.updateSKU({...sku, activo: active});
      this.dataService.showNotification(`SKU ${active?"activado":"desactivado"}`);
    }
  }

  openNewSKUModal() {
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveNewSKU(nombre: string, codigo: string, marca: string, categoria: string) {
    if(!nombre || !codigo) {
      this.dataService.showNotification('Nombre y código son obligatorios', 'error');
      return;
    }
    this.dataService.addSKU({
      id: 0,
      codigo,
      nombre,
      marca,
      categoria,
      activo: true
    });
    this.closeModal();
  }
}
