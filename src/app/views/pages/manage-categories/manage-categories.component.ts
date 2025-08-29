import {Component, ViewChild} from '@angular/core';
import {ColumnMode, DatatableComponent, NgxDatatableModule} from '@siemens/ngx-datatable';
import {ManageCategoriesService} from "../../../core/services/manage-categories.service";
import {filterRows} from "../../../core/util/search.utils";
import {SHARED_IMPORTS} from "../../../core/shared/shared-imports";

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [SHARED_IMPORTS],
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
