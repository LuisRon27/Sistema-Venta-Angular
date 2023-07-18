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
export class MenuService {

    //Api Menu
    private urlApi:string = environment.apiEndpoint + "Menu/"

  constructor(private http:HttpClient) { }

  lista(Id_Usuario: number):Observable<ResponseApi>{
    return this.http.get<ResponseApi>(`${this.urlApi}Lista?Id_Usuario=${Id_Usuario}`)
  }

}
