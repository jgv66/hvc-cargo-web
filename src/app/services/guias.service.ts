import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { map } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class GuiasService {

  API_URL: string;
  fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  fileExtension = '.xlsx';

  constructor(private http: HttpClient) {
    this.API_URL = environment.API_URL;
  }

  retrieveStock(bodega?: string, soloConStock?: boolean) {
    const xUrl = this.API_URL + '/stock' ;
    return this.http.post( xUrl, { bodega, soloConStock } );
  }

  retrieveBodegas() {
    const xUrl = this.API_URL + '/bodegas' ;
    return this.http.get( xUrl );
  }


  exportExcel(jsonData: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveExcelFile(excelBuffer, fileName);
  }

  private saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: this.fileType});
    FileSaver.saveAs(data, fileName + this.fileExtension);
  }

  fechaNormal( fecha ) {
    let anno = fecha.getFullYear().toString();
    let mes  = ( '0' + ( fecha.getMonth() + 1 ).toString() ); 
    let dia  = ( '0' + ( fecha.getDate() ).toString() );
    console.log(anno,mes,dia);
    // const fe = fecha.getFullYear().toString() +
    //            ( '0' + ( fecha.getMonth() + 1 ).toString() ).slice(-2)  +
    //            ( '0' + ( fecha.getDate() ).toString() ).slice(-2);
    const fe = new Date( fecha );
    return fe;
  }

}
