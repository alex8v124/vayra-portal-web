import { Component, computed } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { Storecheck } from '../../core/models/storecheck.model';

@Component({
  selector: 'app-validaciones',
  imports: [],
  templateUrl: './validaciones.html',
  styleUrl: './validaciones.css'
})
export class ValidacionesComponent {
  
  comp = computed(() => this.dataService.storechecks().filter((s: Storecheck) => s.estado === 'Completado').length);
  pend = computed(() => this.dataService.storechecks().filter((s: Storecheck) => s.estado !== 'Completado').length);
  foto = computed(() => this.dataService.storechecks().filter((s: Storecheck) => s.foto).length);

  constructor(public dataService: DataService) {}

  validateSC(sc: Storecheck) {
    this.dataService.updateStorecheck({...sc, estado: 'Completado'});
    this.dataService.showNotification("Storecheck validado y aprobado");
  }
}
