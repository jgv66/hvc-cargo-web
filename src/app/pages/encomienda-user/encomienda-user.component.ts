import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
// sweet alert
import Swal from 'sweetalert2';

import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-encomienda-user',
  templateUrl: './encomienda-user.component.html',
  styleUrls: ['./encomienda-user.component.scss']
})
export class EncomiendaUserComponent implements OnInit {

  estados = [];
  estaPosicion;

  constructor( private router: Router,
               public login: LoginService,
               public dialog: MatDialog,
               private dialogMas: MatDialogRef<EncomiendaUserComponent>,
               @Inject(MAT_DIALOG_DATA) public parametros ) { 
    this.estaPosicion = this.parametros.estaPosicion;
  }

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
    this.estados = this.login.estados;
  }

  salir() {
    this.dialogMas.close();    
  }

  esteUsuario( item ) {
    if ( item.id > 0 || item.id === 0 ) {
      this.estados.forEach( element => {
        if ( element.estado === this.estaPosicion ) {
          element.usuario = item.id;
          element.nombre  = item.nombre;
        }
      });
    }
    this.dialogMas.close({ estados: this.estados }); 
  }

}
