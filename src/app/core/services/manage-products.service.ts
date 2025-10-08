import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ManageProductsService {
  API_URL = `${environment.API_URL}api/products/`;

  constructor(
    private http: HttpClient,
  ) {
  }

  getAllProducts(): Observable<any> {
    return this.http.get<Observable<any>>(this.API_URL + `getAll`);
  }

  createCategories(data: any): Observable<any> {
    return this.http.post<Observable<any>>(this.API_URL + `create`, data);
  }

  editCategories(data: any): Observable<any> {
    return this.http.post<Observable<any>>(this.API_URL + `update`, data);
  }

  deleteCategoriesByID(id: any): Observable<any> {
    return this.http.delete<Observable<any>>(this.API_URL + `delete/${id}`);
  }
}
