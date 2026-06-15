import { Component, computed, signal } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Storecheck } from '../../core/models/storecheck.model';

@Component({
  selector: 'app-validaciones',
  imports: [],
  templateUrl: './validaciones.html',
  styleUrl: './validaciones.css'
})
export class ValidacionesComponent {
  
  activeModal = signal<string | null>(null);
  selectedStorecheck = signal<Storecheck | null>(null);

  // Filtered storechecks based on user role and team
  filteredStorechecks = computed(() => {
    const currentUser = this.auth.currentUser();
    const storechecks = this.dataService.storechecks();
    if (!currentUser) return [];

    // If supervisor, only show members of their commercial team
    if (currentUser.role === 'supervisor') {
      const teamName = currentUser.equipoComercial;
      if (!teamName) return [];
      
      const teamUsernames = this.dataService.users()
        .filter(u => u.equipoComercial === teamName)
        .map(u => u.name.trim().toLowerCase());

      return storechecks.filter(s => {
        const mercName = (s.mercaderista || '').trim().toLowerCase();
        return teamUsernames.some(uName => uName === mercName || uName.includes(mercName) || mercName.includes(uName));
      });
    }

    return storechecks;
  });

  // KPIs should be calculated using the filtered storechecks list for the user
  comp = computed(() => this.filteredStorechecks().filter((s: Storecheck) => s.estado === 'Completado').length);
  pend = computed(() => this.filteredStorechecks().filter((s: Storecheck) => s.estado !== 'Completado').length);
  foto = computed(() => this.filteredStorechecks().filter((s: Storecheck) => s.foto).length);

  constructor(
    public dataService: DataService,
    public auth: AuthService
  ) {}

  validateSC(sc: Storecheck) {
    this.dataService.updateStorecheck({...sc, estado: 'Completado'});
    this.dataService.showNotification("Storecheck validado y aprobado");
  }

  openDetailModal(sc: Storecheck) {
    this.selectedStorecheck.set(sc);
    this.activeModal.set('detail');
  }

  closeModal() {
    this.activeModal.set(null);
    this.selectedStorecheck.set(null);
  }

  getProducts(sc: Storecheck | null): any[] {
    if (!sc) return [];
    if (sc.reporte) {
      try {
        return JSON.parse(sc.reporte);
      } catch (e) {
        console.error("Error parsing storecheck products", e);
      }
    }
    // Fallback con productos de demostración si es un registro previo sin reporte serializado
    return [
      { nombre: 'Inca Kola 1.5L', stockInicial: 12, stockFinal: 8 },
      { nombre: 'Coca Cola Sin Azúcar 1.5L', stockInicial: 24, stockFinal: 19 },
      { nombre: 'Fanta Naranja 1.5L', stockInicial: 10, stockFinal: 4 }
    ];
  }
}
