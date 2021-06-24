import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
// sweet alert
import Swal from 'sweetalert2';

import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-calcularvalor',
  templateUrl: './calcularvalor.component.html',
  styleUrls: ['./calcularvalor.component.scss']
})
export class CalcularvalorComponent implements OnInit {

  cantidad: number;
  alto: number;
  ancho: number;
  largo: number;
  peso: number;

  constructor( private router: Router,
               public login: LoginService,
               private dialogCal: MatDialogRef<CalcularvalorComponent>,
               public dialog: MatDialog ) {}

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
  }

  salir() {
    this.dialogCal.close();    
  }

  updateValor() {}
}
