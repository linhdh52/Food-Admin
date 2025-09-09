import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {ColumnMode, DatatableComponent, SelectionType} from '@siemens/ngx-datatable';
import {ManageCategoriesService} from "../../../core/services/manage-categories.service";
import {filterRows} from "../../../core/util/search.utils";
import {SHARED_IMPORTS} from "../../../core/shared/shared-imports";
import {DataTableColumn} from "../../../core/shared/component/data-table/data-table.component";
import {NgbOffcanvas} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../core/services/alert.service";
import {finalize} from "rxjs";

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './manage-categories.component.html',
  styleUrl: './manage-categories.component.scss'
})
export class ManageCategoriesComponent implements OnInit, AfterViewInit {
  @ViewChild('table') table!: DatatableComponent;
  private offcanvasService = inject(NgbOffcanvas);
  rows: any = [];
  temp: any = [];
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  selected: any[] = [];
  columns: DataTableColumn[] = [
    {name: 'ID', prop: 'id', width: 90},
    {name: 'Tên danh mục', prop: 'name', flexGrow: 2},
    {name: 'Mô tả', prop: 'description', flexGrow: 2},
    {name: 'Đường dẫn web', prop: 'slug'},
    {name: 'Menu cấp', prop: 'parentId'},
    {name: 'State', prop: 'address.state'},
  ];
  categoryForm: FormGroup;
  listCategoriesOption: any[] = [];

  constructor(
    private manageCategoriesService: ManageCategoriesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService
  ) {
  }

  ngOnInit(): void {
    this.getAllCategories();
    this.initForm();
  }

  ngAfterViewInit(): void {
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      parentId: [null],
      active: [true]
    });
  }

  getAllCategories() {
    this.manageCategoriesService.getAllCategories()
      .subscribe({
        next: (res) => {
          this.temp = [...res.data];
          this.rows = res.data;
          this.listCategoriesOption = this.addOptionToListCategories(res.data);
          console.log(this.listCategoriesOption)
        },
        error: (err) => console.error(err)
      });
  }


  updateFilter(ev: any) {
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

  openTop(templateAdd: TemplateRef<any>) {
    this.resetFormAdd();
    this.offcanvasService.open(templateAdd, {
      container: 'body',
      position: 'end',
      panelClass: 'offcanvas-half-centered'
    });
  }

  addOptionToListCategories(categories: any[], level: number = 0): any[] {
    let result: any[] = [];

    result.push({
      isDivider: true,
      displayName: `----- Danh mục cấp ${level + 1} -----`
    });

    categories.forEach(cat => {
      result.push({
        ...cat,
        isDivider: false,
        displayName: `${'-'.repeat(level)} ${cat.name}`.trim()
      });

      if (cat.children && cat.children.length > 0) {
        result = result.concat(this.addOptionToListCategories(cat.children, level + 1));
      }
    });
    return result;
  }

  resetFormAdd() {
    this.categoryForm.reset();
    this.categoryForm.controls.active.setValue(true);
    this.cdr.detectChanges();
  }

  saveCategory() {
    const parentId = this.categoryForm.controls.parentId.value;
    const dataAdd: any = {};
    dataAdd[`name`] = this.categoryForm.controls.name.value ? this.categoryForm.controls.name.value : null;
    dataAdd[`slug`] = this.categoryForm.controls.slug.value ? this.categoryForm.controls.slug.value : null;
    dataAdd[`description`] = this.categoryForm.controls.description.value ? this.categoryForm.controls.description.value : null;
    dataAdd[`parentId`] = parentId != null ? (parentId + 1) : 0;
    dataAdd[`active`] = this.categoryForm.controls.active.value ? this.categoryForm.controls.active.value : true;
    this.manageCategoriesService.createCategories(dataAdd).pipe(finalize(() => {
      this.offcanvasService.dismiss();
    })).subscribe(response => {
      if (response.code === 200 && response.data) {
        this.alertService.success('Tạo mới danh mục thành công!');
        this.getAllCategories();
      } else {
        this.alertService.error(response.message);
      }
    }, error => {
      this.alertService.error('Tạo mới danh mục không thành công!');
    });
  }
}
