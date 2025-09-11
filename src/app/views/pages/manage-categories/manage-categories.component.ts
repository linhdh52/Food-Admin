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
import {DialogService} from "../../../core/services/dialog.service";

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
    private alertService: AlertService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.getAllCategories();
    this.initForm();
    this.categoryForm.controls.level.disable();
  }

  ngAfterViewInit(): void {
  }

  initForm() {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      parentId: [null],
      active: [true],
      level: [0]
    });
  }

  getAllCategories() {
    this.manageCategoriesService.getAllCategories()
      .subscribe({
        next: (res) => {
          this.temp = [...res.data];
          this.rows = res.data;
          this.listCategoriesOption = this.addOptionToListCategories(res.data);
        },
        error: (err) => console.error(err)
      });
  }

  getNameCategory(id: any) {
    const parent  = this.rows.find((item: any) => item.id === id);
    if (parent) {
      return parent.name;
    } else {
      return null;
    }
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
    let message = `Bạn có chắc muốn xóa danh mục tên <b><span style="color:red">${data.name}</span></b>?`;
    if (data.hasChildren === true) {
      message = message + `<br/>Danh mục hiện <b><span style="color:red">ĐANG CÓ</span></b> danh mục con phụ thuộc!`
        + `<br/><span style="color:red">Xoá danh mục </span>`;
    }
    this.dialogService.confirmDialog('Xóa danh mục', message)
      .then(result => {
        if (result.isConfirmed) {
          console.log('Người dùng chọn Đồng ý');
        }
      });
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
    this.categoryForm.controls.level.setValue(0);
    this.categoryForm.controls.level.disable();
    this.cdr.detectChanges();
  }

  selectedParentId(event: any) {
    const parentIdValue = this.categoryForm.controls.parentId.value;
    if (parentIdValue != null && parentIdValue.toString().length > 0) {
      const parent = this.listCategoriesOption.find(item => item.id === parentIdValue);
      this.categoryForm.controls.level.setValue(parent.level + 1);
      this.cdr.detectChanges();
    } else {
      this.categoryForm.controls.level.setValue(0);
    }
  }

  saveCategory() {
    const dataAdd: any = {};
    dataAdd[`name`] = this.categoryForm.controls.name.value ? this.categoryForm.controls.name.value : null;
    dataAdd[`slug`] = this.categoryForm.controls.slug.value ? this.categoryForm.controls.slug.value : null;
    dataAdd[`description`] = this.categoryForm.controls.description.value ? this.categoryForm.controls.description.value : null;
    dataAdd[`parentId`] = this.categoryForm.controls.parentId.value ? this.categoryForm.controls.parentId.value : null;
    dataAdd[`level`] = this.categoryForm.controls.level.value ? this.categoryForm.controls.level.value : 0;
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
