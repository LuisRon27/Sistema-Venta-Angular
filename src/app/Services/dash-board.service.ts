import { Injectable } from '@angular/core';

//import
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

//API
import { environment } from '../Environments/environment';

//import Interfaces
import { ResponseApi } from '../Interfaces/response-api';

@Injectable({
  providedIn: 'root'
})
export class DashBoardService {

  //Api DashBoard
  private urlApi:string = environment.apiEndpoint + "DashBoard/"

  constructor(private http:HttpClient) { }

  resumen():Observable<ResponseApi>{
    return this.http.get<ResponseApi>(`${this.urlApi}Resumen`)
  }
}
