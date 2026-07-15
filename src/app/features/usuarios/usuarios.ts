import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  
  ROLE_LABELS: Record<string, string> = {admin:"Administrador",analista:"Analista",controller:"Controller",supervisor:"Supervisor",mercaderista:"Mercaderista",gerente:"Gerente"};
  ROLE_COLORS: Record<string, string> = {admin:"#8B5CF6",analista:"#0EA5E9",controller:"#3B82F6",supervisor:"#F59E0B",mercaderista:"#10B981",gerente:"#6366F1"};

  showModal = signal(false);
  newUser: any = { name: '', email: '', role: 'mercaderista', equipoComercial: '', pdvsAsignados: '' };
  selectedSupervisorPdvIds = signal<number[]>([]);
  filterPdvModal = signal('');

  filteredPdvsForModal = computed(() => {
    const term = this.filterPdvModal().toLowerCase().trim();
    const list = this.dataService.pdvs();
    if (!term) return list;
    return list.filter(p => p.nombre.toLowerCase().includes(term) || (p.distrito && p.distrito.toLowerCase().includes(term)));
  });

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadModuleData('usuarios');
    this.dataService.loadModuleData('puntos de venta');
  }

  avatarInitials(n: string) {
    if (!n) return "U";
    return n.split(" ").map(w=>w[0]).slice(0,2).join("");
  }

  toggleUser(id: number, event: Event) {
    const active = (event.target as HTMLInputElement).checked;
    const u = this.dataService.users().find(x => x.id === id);
    if(u) {
      this.dataService.updateUser({...u, status: active ? 'Activo' : 'Inactivo'});
      this.dataService.showNotification(`Usuario ${active ? 'activado' : 'desactivado'}`);
    }
  }

  openNewUserModal() {
    this.newUser = { name: '', email: '', role: 'mercaderista', password: '', equipoComercial: '', pdvsAsignados: '' };
    this.selectedSupervisorPdvIds.set([]);
    this.filterPdvModal.set('');
    this.showModal.set(true);
  }

  editUser(u: User) {
    this.newUser = { ...u, password: '' };
    this.selectedSupervisorPdvIds.set(u.pdvsAsignados ? u.pdvsAsignados.split(',').map(Number).filter(Boolean) : []);
    this.filterPdvModal.set('');
    this.showModal.set(true);
  }

  isPdvSelectedForSupervisor(pdvId: number): boolean {
    return this.selectedSupervisorPdvIds().includes(Number(pdvId));
  }

  toggleSupervisorPdv(pdvId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const id = Number(pdvId);
    if (checked) {
      if (!this.selectedSupervisorPdvIds().includes(id)) {
        this.selectedSupervisorPdvIds.update(ids => [...ids, id]);
      }
    } else {
      this.selectedSupervisorPdvIds.update(ids => ids.filter(x => x !== id));
    }
  }

  toggleAllSupervisorPdvs() {
    const allIds = this.dataService.pdvs().map(p => Number(p.id));
    if (this.selectedSupervisorPdvIds().length === allIds.length) {
      this.selectedSupervisorPdvIds.set([]);
    } else {
      this.selectedSupervisorPdvIds.set(allIds);
    }
  }

  getSupervisorPdvsCount(u: User): number {
    if (!u.pdvsAsignados) return 0;
    return u.pdvsAsignados.split(',').map(x => x.trim()).filter(Boolean).length;
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveNewUser() {
    if (!this.newUser.name || !this.newUser.email) {
      this.dataService.showNotification('Por favor completa los campos obligatorios', 'error');
      return;
    }
    
    if (this.newUser.role === 'supervisor') {
      this.newUser.pdvsAsignados = this.selectedSupervisorPdvIds().join(',');
    } else {
      this.newUser.pdvsAsignados = '';
    }

    if (this.newUser.id) {
      // Update existing user
      if (this.newUser.role !== 'mercaderista' && this.newUser.role !== 'supervisor') {
        this.newUser.equipoComercial = '';
      }
      this.dataService.updateUser(this.newUser);
    } else {
      // Create new user
      const userToSave: User = {
        id: 0,
        name: this.newUser.name,
        email: this.newUser.email,
        role: this.newUser.role,
        password: this.newUser.password,
        status: 'Activo',
        equipoComercial: (this.newUser.role === 'mercaderista' || this.newUser.role === 'supervisor') ? (this.newUser.equipoComercial || '') : '',
        pdvsAsignados: (this.newUser.role === 'supervisor') ? this.selectedSupervisorPdvIds().join(',') : ''
      };
      this.dataService.addUser(userToSave);
      this.dataService.showNotification('Usuario creado exitosamente');
    }
    
    this.closeModal();
  }

  deleteUser() {
    if (this.newUser.id && confirm('¿Estás seguro que deseas eliminar permanentemente a este usuario?')) {
      this.dataService.deleteUser(this.newUser.id);
      this.closeModal();
    }
  }
}
