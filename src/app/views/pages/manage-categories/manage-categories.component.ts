import {Component, ViewChild} from '@angular/core';
import {ColumnMode, DatatableComponent, NgxDatatableModule, SelectionType} from '@siemens/ngx-datatable';
import {ManageCategoriesService} from "../../../core/services/manage-categories.service";
import {filterRows} from "../../../core/util/search.utils";
import {SHARED_IMPORTS} from "../../../core/shared/shared-imports";
import {DataTableColumn} from "../../../core/shared/component/data-table/data-table.component";

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
  SelectionType = SelectionType;
  selected: any[] = [];
  columns: DataTableColumn[] = [
    { name: 'ID',            prop: 'id', width: 90 },
    { name: 'Tên danh mục',  prop: 'name',        flexGrow: 2 },
    { name: 'Mô tả',         prop: 'description', flexGrow: 2 },
    { name: 'Đường dẫn web', prop: 'slug' },
    { name: 'Menu cấp',      prop: 'parentId' },
    { name: 'State',         prop: 'address.state' },
  ];

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

  onSelect(evt: { selected: any[] }) {
    this.selected = [...evt.selected];
  }

  onEdit(data: any) {
    console.log(data)
  }

  onDelete(data: any) {

  }
}
