import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  errorMsg = '';

  constructor(private auth: AuthService) {}

  doLogin(email: string, pass: string) {
    if (!this.auth.login(email.trim(), pass)) {
      this.errorMsg = 'Credenciales incorrectas. Intente nuevamente.';
    }
  }

  quickLogin(emailInput: HTMLInputElement, passInput: HTMLInputElement, e: string, p: string) {
    emailInput.value = e;
    passInput.value = p;
  }
}
