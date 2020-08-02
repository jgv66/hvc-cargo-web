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
  buscandoRetiros = false;
  enProceso = false;
  grabandoEnco = false;
  retiros = [];
  encomienda = {};
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
  idpqt: number;
  buscandoID = false;
  estadosPqt = [];
  estados = [];
  estaPosicion = 0;
  buscarUsuario = '';
  cerrarPQT = false;

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
    this.initCarga();
  }

  cargarDatosPendientes( event? ) {
    this.cargando = true;
    this.retiros  = [];
    this.buscandoRetiros = true;
    this.stockSS.servicioWEB( '/pickpend', { ficha: this.login.usuario.id, todos: '*' } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            this.buscandoRetiros = false;
            if ( dev.resultado === 'error' ) {
              Swal.fire('No existen retiros pendientes');
            } else if ( dev.resultado === 'nodata' ) {
              // Swal.fire('No existen retiros pendientes');
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
    this.acopios = [];
    this.stockSS.servicioWEB( '/acopiar', { ficha: this.login.usuario.id, todos: '*' } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              Swal.fire('No existen acopios pendientes');
            } else if ( dev.resultado === 'nodata' ) {
              // Swal.fire('No existen acopios pendientes');
            } else {
              this.acopios = dev.datos;
            }
            if ( event !== undefined ) {
              event.target.complete();
            }
        },
        (error) => {
          if ( error ) {
            console.log(error);
            Swal.fire(error);
          }
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

  revisarEncomienda( item ) {
    this.encomienda = item;
    // console.log(this.encomienda);
  }
  updateEncomienda() {
    // validar lo datos
    // console.log(this.encomienda);
    // si ya estamos procesando....
    this.encomienda['fecha_prometida'] = this.encomienda['llegada'];
    if ( this.encomienda['fecha_prometida'] === undefined || this.encomienda['fecha_prometida'] === null ) {
      Swal.fire('CUIDADO', 'Fecha prometida de llegada no esta definida.');
    } else if ( this.encomienda['valor_cobrado'] < 0 || ( this.encomienda['valor_cobrado'] === 0 && this.encomienda['tipo_pago'] !== 'GRATIS' ) ) {
      Swal.fire('CUIDADO', 'Debe indicar valor cobrado por la encomienda.');
    } else if ( this.encomienda['tipo_pago'] === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de pago de la encomienda.');
    } else if ( this.encomienda['obs_carga'] === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de encomienda que será transportada.');
    } else if ( this.encomienda['bultos'] < 0 || this.encomienda['bultos'] === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar la cantidad de bultos de la encomienda.');
    } else if ( this.encomienda['peso'] < 0 || this.encomienda['peso'] === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el peso de la encomienda.');
    } else if ( this.encomienda['volumen'] < 0 || this.encomienda['volumen'] === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el volumen de la encomienda.');
    } else {
      Swal.fire({
        title: 'Actualizaremos...',
        text: 'Esta acción actualizará los datos de la encomienda ' + this.encomienda['id_paquete'].toString() + ' en el sistema',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No, abandonar...',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, actualiza!'
      }).then((result) => {
        if (result.value) {
          this.regrabarEncomienda();
        }
      });
    }
  }
  async regrabarEncomienda() {
    this.buscandoRetiros = true;
    // origen
    const carga = { id_paquete: this.encomienda['id_paquete'],
                    recepcionista: this.login.usuario.id,
                    fecha_creacion: this.encomienda['fecha_creacion'],
                    cliente: this.encomienda['cliente'],
                    contacto: this.encomienda['contacto'],
                    fecha_prometida: this.encomienda['fecha_prometida'],
                    documento_legal: this.encomienda['documento_legal'] || '',
                    numero_legal: this.encomienda['numero_legal'],
                    bultos: this.encomienda['bultos'],
                    peso: this.encomienda['peso'],
                    volumen: this.encomienda['volumen'],
                    obs_carga: this.encomienda['obs_carga'],
                    tipo_pago: this.encomienda['tipo_pago'],
                    valor_cobrado: this.encomienda['valor_cobrado'],
                    destinatario: this.encomienda['destinatario'] };
    //
    await this.stockSS.servicioWEB( '/grabarEncomienda', carga )
      .subscribe( (data: any) => {
          //
          this.enProceso = false;
          this.buscandoRetiros = false;
          //
          console.log(data);
          if ( data.resultado === 'ok' ) {
            //
            Swal.fire({
              icon: 'success',
              title: 'Nro.Encomienda: ' + data.datos[0].id_pqt,
              text: 'Los datos de la nueva encomienda fueron grabados con éxito',
              footer: '<a href>Nro.Interno : ' + data.datos[0].id_pqt + ' </a>'
            });
            //
            this.initCarga();
            //
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: 'Los datos de la nueva encomienda no fueron grabados',
              footer: '<a href>' + data.datos + '</a>'
            });
          }
      },
      (err) => {
        this.buscandoRetiros = false;
        // console.log(err);
      });
  }

  borrarEncomienda( item ) {
    Swal.fire({
      title: 'ELIMINAR...',
      text: 'Esta acción eliminará la encomienda desde el sistema',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'No, abandonar...',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.value) {
        this.borraLaEncomienda(item);
      }
    });
  }
  removeItemFromArr = ( idpqt ) => {
    for ( let i = 0; i < this.retiros.length; i++) {
      if ( this.retiros[i].id_paquete === idpqt  ) {
        this.retiros.splice(i, 1);
        Swal.fire( '#Seguimiento fue eliminado.' );
        return;
      }
    }
  }
  borraLaEncomienda( item ) {
    this.buscandoRetiros = true;
    this.stockSS.servicioWEB( '/borrar_pqt', { id_pqt: item.id_paquete } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.buscandoRetiros = false;
            if ( dev.resultado === 'error' || dev.resultado === 'nodata' ) {
              Swal.fire( 'La búsqueda no obtuvo resultados. No se borraron Encomiendas.' );
            } else {
              // borrar de la matriz de datos
              this.removeItemFromArr( item.id_paquete );
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
  }

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
    this.carga.valor_cobrado = 0;
    // destino
    this.carga.destinatario = 0;
    this.carga.xrutDestino = '';
    this.carga.xemailDestino = '';
    this.carga.xfonosDestino = '';
    this.carga.xnombreDestino = '';
    this.carga.xdireccDestino = '';
    this.carga.xcomunaDestino = '';
  }
  esteClienteDestino( item, cliente ) {
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
    // validar lo datos
    console.log(this.carga);
    // si ya estamos procesando....
    if ( this.carga.cliente === 0 ) {
      Swal.fire('CUIDADO', 'No se puede grabar sin haber definido al cliente.');
    } else if ( this.carga.fecha_prometida === undefined || this.carga.fecha_prometida === null ) {
      Swal.fire('CUIDADO', 'Fecha prometida de llegada no esta definida.');
    } else if ( this.carga.valor_cobrado < 0 || ( this.carga.valor_cobrado === 0 && this.carga.tipo_pago !== 'GRATIS' ) ) {
      Swal.fire('CUIDADO', 'Debe indicar valor cobrado por la encomienda.');
    } else if ( this.carga.tipo_pago === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de pago de la encomienda.');
    } else if ( this.carga.obs_carga === '' ) {
      Swal.fire('CUIDADO', 'Debe indicar el tipo de carga que será transportada.');
    } else if ( this.carga.bultos < 0 || this.carga.bultos === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar la cantidad de bultos de la encomienda.');
    } else if ( this.carga.peso < 0 || this.carga.peso === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el peso de la encomienda.');
    } else if ( this.carga.volumen < 0 || this.carga.volumen === 0 ) {
      Swal.fire('CUIDADO', 'Debe indicar el volumen de la encomienda.');
    } else if ( this.carga.destinatario === 0 ) {
      Swal.fire('CUIDADO', 'No se puede grabar sin haber definido al destinatario.');
    } else {
      Swal.fire({
        title: 'Grabaremos...',
        text: 'Esta acción generará una nueva encomienda en el sistema',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'No, abandonar...',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, grábala!'
      }).then((result) => {
        if (result.value) {
          this.grabarEncomienda();
        }
      });
    }
  }
  async grabarEncomienda() {
    this.grabandoEnco = true;
    // origen
    const carga = { id_paquete: this.carga.id_paquete,
                    recepcionista: this.carga.recepcionista,
                    fecha_creacion: this.carga.fecha_creacion,
                    cliente: this.carga.cliente,
                    contacto: this.carga.contacto,
                    fecha_prometida: this.carga.fecha_prometida,
                    documento_legal: this.carga.documento_legal,
                    numero_legal: this.carga.numero_legal,
                    bultos: this.carga.bultos,
                    peso: this.carga.peso,
                    volumen: this.carga.volumen,
                    obs_carga: this.carga.obs_carga,
                    tipo_pago: this.carga.tipo_pago,
                    valor_cobrado: this.carga.valor_cobrado,
                    destinatario: this.carga.destinatario };
    //
    await this.stockSS.servicioWEB( '/grabarEncomienda', carga )
      .subscribe( (data: any) => {
          //
          this.enProceso = false;
          this.grabandoEnco = false;
          //
          console.log(data);
          if ( data.resultado === 'ok' ) {
            //
            Swal.fire({
              icon: 'success',
              title: 'Nro.Encomienda: ' + data.datos[0].id_pqt,
              text: 'Los datos de la nueva encomienda fueron grabados con éxito',
              footer: '<a href>Nro.Interno : ' + data.datos[0].id_pqt + ' </a>'
            });
            //
            this.initCarga();
            //
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: 'Los datos de la nueva encomienda no fueron grabados',
              footer: '<a href>' + data.datos + '</a>'
            });
          }
      });
  }

  async buscarPaquete( cambio? ) {
    if ( this.idpqt !== 0 ) {
      this.buscandoID = true;
      this.estadosPqt = [];
      await this.stockSS.servicioWEB( '/estado_pqt', { idpqt: this.idpqt } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.buscandoID = false;
            if ( dev.resultado === 'ok' ) {
              this.estadosPqt = dev.datos;
            } else {
              if ( !cambio ) {
                Swal.fire( 'La búsqueda no obtuvo resultados');
              }
            }
        },
        (error) => {
          Swal.fire('ERROR', error);
        });
    }
  }

  async cambiodeEstado( item ) {
    // limpiar para asignar
    this.login.estados.forEach( element => {
        element.id_estado = 0;
        element.marcada   = false;
        element.anterior  = false;
        element.nombre    = '';
        element.fecha_entera = null;
    });
    //
    this.cerrarPQT = false;
    this.estados = this.login.estados;
    this.estadosPqt = [];
    this.buscandoRetiros = true;
    this.idpqt = item.id_paquete;
    //
    this.stockSS.servicioWEB( '/estado_pqt', { idpqt: this.idpqt } )
      .subscribe( (dev: any) => {
        this.buscandoRetiros = false;
        if ( dev.resultado === 'ok' ) {
            this.estadosPqt = dev.datos;
            // console.log('this.estadosPqt', this.estadosPqt);
            // revisar estados
            let pos = 0; let i = -1;
            this.estados.forEach(element => {
              ++i;
              pos = this.estadosPqt.findIndex( (est: any) => est.estado === element.estado );
              if ( pos !== -1 ) {
                this.estados[i].id_estado    = this.estadosPqt[pos].id;
                this.estados[i].fecha_entera = this.estadosPqt[pos].fecha_entera;
                this.estados[i].marcada      = true;
                this.estados[i].anterior     = true;
                this.estados[i].nombre       = this.estadosPqt[pos].nombre;
                this.estados[i].usuario      = this.estadosPqt[pos].usuario;
              }
            });
          }
      },
      (error) => {
        this.buscandoRetiros = false;
        Swal.fire('ERROR', error);
      });
    //
  }
  cambiarUsuario( item ) {
    this.estaPosicion = item.estado;
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
  }
  cambiandoEstado( item ) {
    if ( item.anterior === true ) {
      Swal.fire({
        icon: 'error',
        title: 'Cuidado...',
        text: 'No puede deshacer un hecho pasado, solo puede cambiar el Usuario asignado',
      });
    } else {
      item.marcada = !item.marcada;
      if ( item.marcada ) {
        item.usuario      = this.login.usuario.id;
        item.nombre       = this.login.usuario.nombre;
        item.fecha_entera = new Date();
      } else {
        item.usuario      = 0;
        item.nombre       = '';
        item.fecha_entera = null;
      }
    }
  }

  updateEstados() {
    const texto = 'Esta acción actualizará los estados de la encomienda en el sistema' + (this.cerrarPQT) ? '. Y cerrará el registro. Está de acuerdo?' : '';
    Swal.fire({
      title: 'Grabaremos...',
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'No, abandonar...',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar!'
    }).then((result) => {
      if (result.value) {
        this.grabarEstados();
      }
    });

  }

  async grabarEstados() {
    this.buscandoRetiros = true;
    // origen
    const carga = { id_paquete: this.idpqt,
                    cierre: this.cerrarPQT,
                    estados: this.estados };
    //
    await this.stockSS.servicioWEB( '/grabarEstados', carga )
      .subscribe( (data: any) => {
          //
          this.buscandoRetiros = false;
          //
          console.log(data);
          if ( data.resultado === 'ok' ) {
            //
            Swal.fire({
              icon: 'success',
              title: 'Nro.Encomienda: ' + data.datos[0].id_pqt,
              text: 'El cambio de estado de la encomienda fue grabado con éxito',
              footer: '<a href>Nro.Interno : ' + data.datos[0].id_pqt + ' </a>'
            });
            //
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Cuidado...',
              text: 'Los datos de cambio de estado de la encomienda no fueron grabados',
              footer: '<a href>' + data.datos + '</a>'
            });
          }
      });
  }

}
