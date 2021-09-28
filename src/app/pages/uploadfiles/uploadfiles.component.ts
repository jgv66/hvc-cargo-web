import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';

// sweet alert
import Swal from 'sweetalert2';

import { FileUploadService } from '../../services/file-upload.service';
import { LoginService } from '../../services/login.service';
import { StockService } from '../../services/stock.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-uploadfiles',
  templateUrl: './uploadfiles.component.html',
  styleUrls: ['./uploadfiles.component.scss']
})
export class UploadfilesComponent implements OnInit {

  url = '';
  form: FormGroup;
  progress: number = 0;
  extension = '';
  archivo;

  constructor(private router: Router,
              public fb: FormBuilder,
              public fileUploadService: FileUploadService,
              public login: LoginService,
              public stockSS: StockService,
              private dialogCal: MatDialogRef<UploadfilesComponent>,
              @Inject(MAT_DIALOG_DATA) public data,
              public dialog: MatDialog ) {
    this.url = environment.URL_IMAGENES;
    this.form = this.fb.group({
      name: [''],
      avatar: [null]
    })
    console.log(this.data);
  }

  ngOnInit() {}

  salir() {
    this.dialogCal.close();    
  }

  async uploadFile(event) {
    //
    this.archivo   = (event.target as HTMLInputElement).files[0];
    this.extension = await this.getExtension( this.archivo.name );
    //
    this.form.patchValue({
      avatar: this.archivo
    });
    this.form.get('avatar').updateValueAndValidity()
    //
  }

  submitUser() {
    this.fileUploadService.addFile( this.form.value.avatar, this.data, this.extension )
      .subscribe( (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            // console.log('Request has been made!');
            break;
          case HttpEventType.ResponseHeader:
            // console.log('Response header has been received!');
            break;
          case HttpEventType.UploadProgress:
            this.progress = Math.round(event.loaded / event.total * 100);
            // console.log(`Uploaded! ${this.progress}%`);
            break;
          case HttpEventType.Response:
            // console.log('User successfully created!', event.body);
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Archivo se ha adjuntado',
              showConfirmButton: false,
              timer: 1500
            })
            setTimeout(() => {
              this.progress = 0;
              this.salir();
            }, 1500);
        }
      });
  }

  getExtension( path ) {
    //
    const basename = path.split(/[\\/]/).pop(),   // extract file name from full path ... (supports `\\` and `/` separators)
        pos = basename.lastIndexOf(".");          // get last position of `.`
    //
    if (basename === "" || pos < 1)            // if file name is empty or ...
        return "";                             //  `.` not found (-1) or comes first (0)
    //
    return basename.slice(pos + 1);            // extract extension ignoring `.`
    //
  }
}
