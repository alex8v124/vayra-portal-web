import { Component, computed, signal } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-actividades',
  imports: [],
  templateUrl: './actividades.html',
  styleUrl: './actividades.css'
})
export class ActividadesComponent {
  
  vigentes = computed(() => this.dataService.actividades().filter(a => a.estado === 'Vigente'));
  caducadas = computed(() => this.dataService.actividades().filter(a => a.estado === 'Caducada'));

  activeModal = signal<'none' | 'new_act' | 'edit_act' | 'delete_act'>('none');
  selectedAct = signal<any>(null);
  selectedSkuIds = signal<number[]>([]);

  skuFilter = signal('');
  skuCatFilter = signal('');

  uniqueCategories = computed(() => {
    const cats = this.dataService.skus().map(s => s.categoria).filter(c => c);
    return [...new Set(cats)].sort();
  });

  filteredSkusForModal = computed(() => {
    const term = this.skuFilter().toLowerCase();
    const cat = this.skuCatFilter();
    return this.dataService.skus().filter(s => {
      const matchTerm = s.nombre.toLowerCase().includes(term) || s.codigo.toLowerCase().includes(term);
      const matchCat = cat === '' || s.categoria === cat;
      return matchTerm && matchCat;
    });
  });

  activePlanningsToday = computed(() => {
    const currentUser = this.auth.currentUser();
    if (!currentUser || currentUser.role !== 'mercaderista') return [];
    const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD local
    return this.dataService.plannings().filter(p => 
      p.usuarioId === currentUser.id && todayStr >= p.fechaInicio && todayStr <= p.fechaFin
    );
  });

  isActividadActiveToday(actId: number): boolean {
    return this.activePlanningsToday().some(p => {
      if (!p.actIds) return false;
      const ids = p.actIds.split(',').map(Number);
      return ids.includes(actId);
    });
  }

  constructor(public dataService: DataService, public auth: AuthService) {}

  getSkuNames(skuIds: number[]) {
    return skuIds.map(id => this.dataService.skus().find(s => s.id === id)?.nombre).filter(Boolean);
  }

  toggleActividad(id: number, event: Event) {
    const active = (event.target as HTMLInputElement).checked;
    const a = this.dataService.actividades().find(x => x.id === id);
    if(a) {
      this.dataService.updateActividad({...a, estado: active ? 'Vigente' : 'Caducada'});
      this.dataService.showNotification(`Actividad ${active?"activada — ahora Vigente":"desactivada — marcada como Caducada"}`);
    }
  }

  toggleSkuSelection(skuId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedSkuIds.update(ids => [...ids, skuId]);
    } else {
      this.selectedSkuIds.update(ids => ids.filter(id => id !== skuId));
    }
  }

  updateSkuFilter(event: Event) {
    this.skuFilter.set((event.target as HTMLInputElement).value);
  }

  updateSkuCatFilter(event: Event) {
    this.skuCatFilter.set((event.target as HTMLSelectElement).value);
  }

  closeModal() {
    this.activeModal.set('none');
    this.selectedAct.set(null);
    this.selectedSkuIds.set([]);
    this.skuFilter.set('');
    this.skuCatFilter.set('');
  }

  openNewActModal() {
    this.selectedSkuIds.set([]);
    this.activeModal.set('new_act');
  }

  openEditActModal(id: number) {
    const act = this.dataService.actividades().find(x => x.id === id);
    if(act) {
      this.selectedAct.set(act);
      this.selectedSkuIds.set([...act.skuIds]);
      this.activeModal.set('edit_act');
    }
  }

  saveAct(nombre: string, tipo: string, estado: string, inicio: string, fin: string, descripcion: string) {
    if(!nombre || !inicio || !fin) {
      this.dataService.showNotification('El nombre y fechas son obligatorios', 'error');
      return;
    }
    const isEdit = this.activeModal() === 'edit_act';
    const act = {
      id: isEdit ? this.selectedAct().id : 0,
      nombre, tipo, estado, inicio, fin, descripcion, 
      skuIds: this.selectedSkuIds()
    };
    
    if (isEdit) {
      this.dataService.updateActividad(act as any);
    } else {
      this.dataService.addActividad(act as any);
    }
    
    this.closeModal();
  }

  confirmDeleteAct(id: number) {
    const act = this.dataService.actividades().find(x => x.id === id);
    if(act) {
      this.selectedAct.set(act);
      this.activeModal.set('delete_act');
    }
  }

  deleteAct() {
    if(this.selectedAct()) {
      this.dataService.deleteActividad(this.selectedAct().id);
      this.dataService.showNotification('Actividad eliminada correctamente');
    }
    this.closeModal();
  }
}
