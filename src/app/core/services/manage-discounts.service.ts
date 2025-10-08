import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ManageDiscountsService {
  API_URL = `${environment.API_URL}api/discounts/`;

  constructor(
    private http: HttpClient,
  ) {
  }

  getAllDiscounts(): Observable<any> {
    return this.http.get<Observable<any>>(this.API_URL + `getAll`);
  }

  createDiscounts(data: any): Observable<any> {
    return this.http.post<Observable<any>>(this.API_URL + `create`, data);
  }

  editDiscounts(data: any): Observable<any> {
    return this.http.post<Observable<any>>(this.API_URL + `update`, data);
  }

  deleteDiscountsByID(id: any): Observable<any> {
    return this.http.delete<Observable<any>>(this.API_URL + `delete/${id}`);
  }
}
