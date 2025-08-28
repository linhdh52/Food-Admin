import {Component, ViewChild} from '@angular/core';
import {ColumnMode, DatatableComponent, NgxDatatableModule} from '@siemens/ngx-datatable';
import {RouterLink} from "@angular/router";
import {ManageCategoriesService} from "../../../core/services/manage-categories.service";
import {HttpClient} from "@angular/common/http";
import {filterRows} from "../../../core/util/search.utils";

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    NgxDatatableModule,
    RouterLink
  ],
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.scss'
})
export class ManageCategoriesComponent {

  rows: any = [];
  temp: any = [];
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;

  @ViewChild('table') table: DatatableComponent

  constructor(
    private manageCategoriesService: ManageCategoriesService,
    private http: HttpClient
  ) {
    this.getAllCategories();
    console.log(this.ColumnMode)
  }

  getAllCategories() {
    this.manageCategoriesService.getAllCategories()
      .subscribe({
        next: (res) => {
          this.temp = [...res.data]
          this.rows = res.data
        },
        error: (err) => console.error(err)
      });
  }


  updateFilter(ev: Event) {
    const q = (ev.target as HTMLInputElement).value ?? '';
    this.rows = filterRows(this.temp, ['name'], q, {
      mode: 'AND',
      noDiacritics: true,
      caseSensitive: false
    });
    this.table.offset = 0;
  }

}
