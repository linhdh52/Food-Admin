import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ManageDiscountsService {
  API_URL = `${environment.API_URL}api/discounts/`;
  LIST_DATE = [
    {id: 'mo', name: 'Thứ hai'},
    {id: 'tu', name: 'Thứ ba'},
    {id: 'we', name: 'Thứ tư'},
    {id: 'th', name: 'Thứ năm'},
    {id: 'fr', name: 'Thứ sáu'},
    {id: 'sa', name: 'Thứ bảy'},
    {id: 'su', name: 'Chủ nhật'}
  ];
  LIST_SCOPE = [
    {id: 'PRODUCT', name: 'Sản phẩm'},
    {id: 'ORDER', name: 'Đơn hàng'}
  ];
  LIST_DISCOUNT_TYPE = [
    {id: 'PERCENT', name: 'Theo %'},
    {id: 'AMOUNT', name: 'Theo số tiền'},
  ];

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

  getListDate() {
    return this.LIST_DATE;
  }

  getListScope() {
    return this.LIST_SCOPE;
  }

  getListDiscountType() {
    return this.LIST_DISCOUNT_TYPE;
  }
}
