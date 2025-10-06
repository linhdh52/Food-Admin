import {AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ColumnMode, DatatableComponent, SelectionType} from '@siemens/ngx-datatable';
import {SHARED_IMPORTS} from "../../../core/shared/shared-imports";
import {DataTableColumn} from "../../../core/shared/component/data-table/data-table.component";
import {ManageCategoriesService} from "../../../core/services/manage-categories.service";
import {AlertService} from "../../../core/services/alert.service";
import {DialogService} from "../../../core/services/dialog.service";
import {OffCanvasService} from "../../../core/services/off-canvas.service";
import {ImageCropperResult, ImageCropperService} from "../../../core/services/image-cropper.service";
import {filterRows} from "../../../core/util/search.utils";
import {finalize} from "rxjs";

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.scss'
})
export class ManageProductsComponent implements OnInit, AfterViewInit {
  @ViewChild('table') table!: DatatableComponent;
  rows: any = [];
  temp: any = [];
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  selected: any[] = [];
  isEdit: boolean = false;
  dataEdit: any = null;
  categoryForm: FormGroup;
  listCategoriesOption: any[] = [];
  listCategoriesOptionNotChange: any[] = [];
  idColW = 60;

  constructor(
    private manageCategoriesService: ManageCategoriesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    private dialogService: DialogService,
    private offCanvasService: OffCanvasService,
    private imageCropper: ImageCropperService
  ) {
  }

  ngOnInit(): void {
    this.getAllCategories();
    this.initForm();
    this.idColW = this.fitByChars(this.rows, 'id');
  }

  ngAfterViewInit(): void {
  }

  initForm() {
    this.categoryForm = this.fb.group({
      id: [null],
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
          this.listCategoriesOptionNotChange = this.addOptionToListCategories(res.data);
        },
        error: (err) => console.error(err)
      });
  }

  getNameCategory(id: any) {
    const parent = this.rows.find((item: any) => item.id === id);
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

  onEdit(data: any, template: TemplateRef<any>) {
    this.resetForm();
    this.isEdit = true;
    this.dataEdit = data;
    this.categoryForm.patchValue({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
      active: data.active,
      level: data.level,
    });
    this.categoryForm.controls.id.disable();
    this.categoryForm.controls.level.disable();
    this.listCategoriesOption = this.listCategoriesOptionNotChange.filter(item => item.id != this.dataEdit.id);
    this.offCanvasService.open(template, {
      container: 'body',
      position: 'end',
      panelClass: 'offcanvas-half-centered'
    }, {onClose: () => this.resetEditStatus(), onDismiss: () => this.resetEditStatus()});
  }

  onDelete(data: any) {
    let message = `Bạn có chắc muốn xóa danh mục tên <b><span style="color:red">${data.name}</span></b>?`;
    if (data.hasChildren === true) {
      message = message + `<br/>Danh mục hiện <b><span style="color:red">ĐANG CÓ</span></b> danh mục con phụ thuộc!`
        + `<br/><span style="color:red">Xoá danh mục này sẽ xóa cả những danh mục phụ thuộc của nó!</span>`;
    }
    this.dialogService.confirmDialog('Xóa danh mục', message)
      .then(result => {
        if (result.isConfirmed) {
          this.manageCategoriesService.deleteCategoriesByID(data.id).pipe(finalize(() => {
            this.offCanvasService.close();
          })).subscribe(response => {
            if (response.code === 200 && response.data) {
              this.alertService.success('Xoá danh mục thành công!');
              this.getAllCategories();
            } else {
              this.alertService.error(response.message);
            }
          }, error => {
            this.alertService.error('Xoá danh mục không thành công!');
          });
        }
      });
  }

  openTop(template: TemplateRef<any>) {
    this.resetForm();
    this.isEdit = false;
    this.listCategoriesOption = this.listCategoriesOptionNotChange;
    this.categoryForm.controls.id.disable();
    this.categoryForm.controls.level.disable();
    this.offCanvasService.open(template, {
      container: 'body',
      position: 'end',
      panelClass: 'offcanvas-half-centered'
    }, {onClose: () => this.resetEditStatus(), onDismiss: () => this.resetEditStatus()});
  }

  addOptionToListCategories(categories: any[], level: number = 0): any[] {
    let result: any[] = [];
    if (categories.length > 0) {
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
    }
    return result;
  }

  resetForm() {
    if (this.isEdit && this.dataEdit) {
      this.categoryForm.patchValue({
        id: this.dataEdit.id,
        name: this.dataEdit.name,
        slug: this.dataEdit.slug,
        description: this.dataEdit.description,
        parentId: this.dataEdit.parentId,
        active: this.dataEdit.active,
        level: this.dataEdit.level,
      });
      this.listCategoriesOption = this.listCategoriesOptionNotChange.filter(item => item.id != this.dataEdit.id);
    } else {
      this.categoryForm.reset();
      this.categoryForm.controls.active.setValue(true);
      this.categoryForm.controls.level.setValue(0);
      this.listCategoriesOption = this.listCategoriesOptionNotChange;
    }
    this.categoryForm.controls.id.disable();
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
    if (this.isEdit && this.dataEdit) {
      const dataEdit: any = {};
      dataEdit[`id`] = this.dataEdit.id;
      dataEdit[`name`] = this.categoryForm.controls.name.value ? this.categoryForm.controls.name.value : null;
      dataEdit[`slug`] = this.categoryForm.controls.slug.value ? this.categoryForm.controls.slug.value : null;
      dataEdit[`description`] = this.categoryForm.controls.description.value ? this.categoryForm.controls.description.value : null;
      dataEdit[`parentId`] = this.categoryForm.controls.parentId.value ? this.categoryForm.controls.parentId.value : null;
      dataEdit[`level`] = this.categoryForm.controls.level.value ? this.categoryForm.controls.level.value : 0;
      dataEdit[`active`] = this.categoryForm.controls.active.value ? this.categoryForm.controls.active.value : true;
      this.manageCategoriesService.editCategories(dataEdit).pipe(finalize(() => {
        this.offCanvasService.close();
      })).subscribe(response => {
        if (response.code === 200 && response.data) {
          this.alertService.success('Chỉnh sửa danh mục thành công!');
          this.getAllCategories();
        } else {
          this.alertService.error(response.message);
        }
      }, error => {
        this.alertService.error('Chỉnh sửa danh mục không thành công!');
      });
    } else {
      const dataAdd: any = {};
      dataAdd[`name`] = this.categoryForm.controls.name.value ? this.categoryForm.controls.name.value : null;
      dataAdd[`slug`] = this.categoryForm.controls.slug.value ? this.categoryForm.controls.slug.value : null;
      dataAdd[`description`] = this.categoryForm.controls.description.value ? this.categoryForm.controls.description.value : null;
      dataAdd[`parentId`] = this.categoryForm.controls.parentId.value ? this.categoryForm.controls.parentId.value : null;
      dataAdd[`level`] = this.categoryForm.controls.level.value ? this.categoryForm.controls.level.value : 0;
      dataAdd[`active`] = this.categoryForm.controls.active.value ? this.categoryForm.controls.active.value : true;
      this.manageCategoriesService.createCategories(dataAdd).pipe(finalize(() => {
        this.offCanvasService.close();
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

  private resetEditStatus() {
    this.isEdit = false;
    this.dataEdit = null;
    this.categoryForm.controls.id.disable();
    this.categoryForm.controls.level.disable();
  }

  async openCropper() {
    try {
      const result: ImageCropperResult = await this.imageCropper.open({
        fileName: 'category.png',
        presetKey: 'square600'
      });

      const file = this.base64ToFile(result.fileBase64, result.fileName);
      const fd = new FormData();
      fd.append('image', file);
    } catch {
    }
  }

  private base64ToFile(base64: string, filename: string): File {
    const [head, body] = base64.split(',');
    const mime = head.match(/:(.*?);/)?.[1] || 'image/png';
    const bin = atob(body);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new File([u8], filename, {type: mime});
  }

  private fitByChars(rows: any[], prop: string, min = 56, max = 140, ch = 9, pad = 28) {
    const longest = Math.max(
      prop.length,
      ...rows.map(r => String(r?.[prop] ?? '').length)
    );
    return Math.min(max, Math.max(min, longest * ch + pad));
  }
}
