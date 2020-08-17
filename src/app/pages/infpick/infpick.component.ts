import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { StockService } from '../../services/stock.service';
import { GuiasService } from '../../services/guias.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material';

// ES6 Modules or TypeScript
import Swal from 'sweetalert2';

@Component({
  selector: 'app-infpick',
  templateUrl: './infpick.component.html',
  styleUrls: ['./infpick.component.scss'],
})
export class InfpickComponent implements OnInit {

  @ViewChild( MatPaginator, {static: true}) paginator: MatPaginator;

  dataSource: MatTableDataSource<any>;

  displayedColumns: string[] = ['id_paquete', 'fecha_creacion', 'obs_carga', 'cli_razon', 'des_razon', 'tipo_pago', 'estado'];
  pageSize = 10;

  fechaIni = new Date();
  fechaFin = new Date();
  filtro = '';
  cargando = false;
  retiros = [];

  constructor( private router: Router,
               public login: LoginService,
               private stockSS: StockService,
               private guias: GuiasService ) { }

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
  }

  exportar() {
    const salida = [];
    this.retiros.forEach( elem => {
      salida.push({ encomienda: elem.id_paquete, cliente: elem.cliente, destinatario: elem.destinatario, obs_carga: elem.obs_carga,
                    peso: elem.peso, volumen: elem.volumen, bultos: elem.bultos, valor: elem.valor,
                    tipo_pago: elem.tipo_pago, desc_pago: elem.desc_pago, fecha_creacion: elem.fecha_creacion, cli_razon: elem.cli_razon,
                    cli_direccion: elem.cli_direccion, cli_comuna: elem.cli_comuna, cli_fono: elem.cli_fono1,
                    des_razon: elem.des_razon, des_direccion: elem.des_direccion, des_comuna: elem.des_comuna,
                    des_fono: elem.des_fono1, estado: elem.estado, pickeador: elem.pickeador});
    });
    this.guias.exportExcel( salida, 'encomiendas' );
  }

  aplicarFiltro( event: Event ) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onRowClicked(row) {
    // console.log(row);
  }

  consultar( event? ) {
    // tslint:disable-next-line: no-console
    // console.time( '1' );
    this.cargando = true;
    this.retiros  = [];
    this.stockSS.servicioWEB( '/dameEncomiendas', { ficha: this.login.usuario.id,
                                                    idCliente: 0, idDestina: 0,
                                                    fechaIni: this.guias.fechaNormal( this.fechaIni ) ,
                                                    fechaFin: this.guias.fechaNormal( this.fechaFin ) } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' || dev.resultado === 'nodata' ) {
              Swal.fire('No existen encomiendas para los parámetros entregados.');
            } else {
              this.retiros = dev.datos;
              this.dataSource = new MatTableDataSource(dev.datos);
              this.dataSource.paginator = this.paginator;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          Swal.fire(error);
        });
    // tslint:disable-next-line: no-console
    // console.timeEnd( '1' );
  }

  onPaginateChange(event) {
    console.log(event);
  }


}
