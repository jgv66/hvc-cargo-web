import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StockService } from '../../services/stock.service';
import { LoginService } from '../../services/login.service';

// ES6 Modules or TypeScript
import Swal from 'sweetalert2';

@Component({
  selector: 'app-encomiendas',
  templateUrl: './encomiendas.component.html',
  styleUrls: ['./encomiendas.component.scss']
})
export class EncomiendasComponent implements OnInit {

  grabando = false;
  cargando = false;
  buscando = false;
  buscandoChico = false;
  retiros = [];
  acopios = [];
  clientes = [];
  linea: any = {};
  carga: any = {};
  clienteChico = [];
  fecha: Date;
  foto;
  idfoto;
  nombreorut = '';
  buscarCliente = '';
  offset = 0;

  constructor( private router: Router,
               public login: LoginService,
               private stockSS: StockService ) { }

  ngOnInit() {
    if ( !this.login.usuario ) {
      this.router.navigate(['/login']);
    }
    this.cargarDatosPendientes();
    this.cargarDatosAcopio();
    this.cargarDatosClientes();
  }

  cargarDatosPendientes( event? ) {
    this.cargando = true;
    this.stockSS.servicioWEB( '/pickpend', { ficha: this.login.usuario.id, todos: '*' } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              Swal.fire('No existen retiros pendientes');
            } else if ( dev.resultado === 'nodata' ) {
              Swal.fire('No existen retiros pendientes');
            } else {
              this.retiros = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          Swal.fire(error);
        });
  }
  doRefreshPendientes( event ) {
    this.cargarDatosPendientes( event );
  }

  cargarDatosAcopio( event? ) {
    this.cargando = true;
    this.stockSS.servicioWEB( '/acopiar', { ficha: this.login.usuario.id, todos: '*' } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              Swal.fire('No existen acopios pendientes');
            } else if ( dev.resultado === 'nodata' ) {
              Swal.fire('No existen acopios pendientes');
            } else {
              this.acopios = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          Swal.fire(error);
        });
  }
  doRefreshAcopio( event ) {
    this.cargarDatosAcopio( event );
  }

  nextCliente() {
    this.offset += 15;
    this.cargarDatosClientes();
  }
  previoCliente() {
    this.offset -= 15;
    if ( this.offset < 0 ) {
       this.offset = 0;
    }
    this.cargarDatosClientes();
  }

  cargarDatosClientes( event? ) {
    this.buscando = true;
    this.stockSS.servicioWEB( '/clientes', { buscar: this.nombreorut, offset: this.offset } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.buscando = false;
            if ( dev.resultado === 'error' ) {
              Swal.fire( (this.nombreorut !== '' ) ? 'La búsqueda no obtuvo resultados' : 'No existen clientes definidos');
            } else if ( dev.resultado === 'nodata' ) {
              Swal.fire( (this.nombreorut !== '' ) ? 'La búsqueda no obtuvo resultados' : 'No existen clientes definidos');
            } else {
              this.clientes = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
  }
  doRefreshClientes( event ) {
    this.cargarDatosClientes( event );
  }

  revisarEncomienda() {}
  ValidarCreacion() {}
  rescataCC() {}
  borrarEncomienda( item ) {}

  cargarFoto( item ) {
    this.foto   = undefined;
    this.idfoto = undefined;
    this.cargando = true;
    const IMG_URL = this.stockSS.url + '/public/img/' ;
    this.stockSS.servicioWEB( '/getimages', { id_pqt: item.id_paquete } )
        .subscribe( (dev: any) => {
          this.cargando = false;
          // console.log(dev);
          if ( dev.resultado === 'ok' ) {
            this.idfoto = item.id_paquete;
            this.foto   = IMG_URL + dev.datos[0].imgb64;
            console.log(this.foto);
          }
        });
  }

  crearCliente() {
    this.linea.id_cliente = 0;
    this.linea.rut = '';
    this.linea.razon_social = '';
    this.linea.nombre_fantasia = '';
    this.linea.direccion = '';
    this.linea.ciudad = '';
    this.linea.comuna = '';
    this.linea.referencias = '';
    this.linea.email = '';
    this.linea.telefono1 = '';
    this.linea.telefono2 = '';
    this.linea.tipo = '';
    this.linea.lat = '';
    this.linea.lng = '';
  }

  editarCliente( item ) {
    this.linea = item;
  }

  grabarCliente() {
    this.buscando = true;
    this.stockSS.servicioWEB( '/upClientes', this.linea )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.buscando = false;
            if ( dev.resultado === 'ok' ) {
              this.limpiar();
              Swal.fire('Cliente fue grabado con éxito' );
            } else  {
              Swal.fire( dev.datos );
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
  }

  limpiar() {
    this.offset = 0;
    this.nombreorut = '';
    this.cargarDatosClientes();
  }

  buscarClientes() {
    if ( this.nombreorut !== '' ) {
      this.offset = 0;
      this.cargarDatosClientes();
    } else {
      Swal.fire( 'No existen datos para buscar.' );
    }
  }

  limpiaDataChica() {
    this.buscarCliente = '';
    this.clienteChico = [];
  }

  buscarClientesChico() {
    if ( this.buscarCliente !== '' ) {
      this.buscandoChico = true;
      this.stockSS.servicioWEB( '/clientes', { buscar: this.buscarCliente, offset: this.offset } )
          .subscribe( (dev: any) => {
              // console.log(dev);
              this.buscandoChico = false;
              if ( dev.resultado === 'ok' ) {
                this.clienteChico = dev.datos;
              } else {
                Swal.fire( 'La búsqueda no obtuvo resultados');
              }
          },
          (error) => {
            Swal.fire('ERROR', error);
          });
    }
  }

  initCarga() {
    // origen
    this.carga.id_paquete = 0;
    this.carga.recepcionista = this.login.usuario.id;
    this.carga.fecha_creacion = new Date();
    this.carga.cliente = 0;
    this.carga.xrutCliente = '';
    this.carga.xemailCliente = '';
    this.carga.xfonosCliente = '';
    this.carga.xnombreCliente = '';
    this.carga.xdireccCliente = '';
    this.carga.xcomunaCliente = '';
    this.carga.contacto = '';
    this.carga.fecha_prometida = new Date();
    this.carga.documento_legal = '';
    this.carga.numero_legal = '';
    this.carga.bultos = 0;
    this.carga.peso = 0;
    this.carga.volumen = 0;
    this.carga.obs_carga = '';
    this.carga.tipo_pago = '';
    this.carga.valor_cobrado = '';
    // destino
    this.carga.destinatario = '';
    this.carga.xrutDestino = '';
    this.carga.xemailDestino = '';
    this.carga.xfonosDestino = '';
    this.carga.xnombreDestino = '';
    this.carga.xdireccDestino = '';
    this.carga.xcomunaDestino = '';
  }

  esteClienteDestino( item, cliente ) {
    console.log(item);
    console.log(cliente);
    if ( cliente === true ) {
      this.carga.cliente        = item.id_cliente;
      this.carga.xrutCliente    = item.rut;
      this.carga.xemailCliente  = item.email;
      this.carga.xfonosCliente  = item.telefono1 + '   ' + item.telefono2;
      this.carga.xnombreCliente = item.razon_social;
      this.carga.xdireccCliente = item.direccion;
      this.carga.xcomunaCliente = item.comuna;
    } else {
      this.carga.destinatario   = item.id_cliente;
      this.carga.xrutDestino    = item.rut;
      this.carga.xemailDestino  = item.email;
      this.carga.xfonosDestino  = item.telefono1 + '   ' + item.telefono2;
      this.carga.xnombreDestino = item.razon_social;
      this.carga.xdireccDestino = item.direccion;
      this.carga.xcomunaDestino = item.comuna;
    }
  }

  crearEncomienda() {

  }


}
