import { Component, signal, OnInit } from '@angular/core';
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
  
  ROLE_LABELS: Record<string, string> = {admin:"Administrador",analista:"Analista",supervisor:"Supervisor",mercaderista:"Mercaderista"};
  ROLE_COLORS: Record<string, string> = {admin:"#8B5CF6",analista:"#0EA5E9",supervisor:"#F59E0B",mercaderista:"#10B981"};

  showModal = signal(false);
  newUser: any = { name: '', email: '', role: 'mercaderista', equipoComercial: '' };

  constructor(public dataService: DataService) {}

  ngOnInit() {
    this.dataService.loadModuleData('usuarios');
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
    this.newUser = { name: '', email: '', role: 'mercaderista', password: '', equipoComercial: '' };
    this.showModal.set(true);
  }

  editUser(u: User) {
    this.newUser = { ...u, password: '' };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveNewUser() {
    if (!this.newUser.name || !this.newUser.email) {
      this.dataService.showNotification('Por favor completa los campos obligatorios', 'error');
      return;
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
        equipoComercial: (this.newUser.role === 'mercaderista' || this.newUser.role === 'supervisor') ? (this.newUser.equipoComercial || '') : ''
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
