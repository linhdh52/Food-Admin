import {AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ColumnMode, DatatableComponent, SelectionType} from "@siemens/ngx-datatable";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../core/services/alert.service";
import {DialogService} from "../../../core/services/dialog.service";
import {OffCanvasService} from "../../../core/services/off-canvas.service";
import {ImageCropperResult, ImageCropperService} from "../../../core/services/image-cropper.service";
import {filterRows} from "../../../core/util/search.utils";
import {finalize} from "rxjs";
import {SHARED_IMPORTS} from "../../../core/shared/shared-imports";
import {ManageDiscountsService} from "../../../core/services/manage-discounts.service";

@Component({
  selector: 'app-manage-discounts',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './manage-discounts.component.html',
  styleUrl: './manage-discounts.component.scss'
})
export class ManageDiscountsComponent implements OnInit, AfterViewInit {
  @ViewChild('table') table!: DatatableComponent;
  rows: any = [];
  temp: any = [];
  loadingIndicator = true;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  selected: any[] = [];
  isEdit: boolean = false;
  dataEdit: any = null;
  discountForm: FormGroup;
  idColW = 60;
  LIST_DATE: any = [];
  LIST_SCOPE: any = [];
  LIST_DISCOUNT_TYPE: any = [];
  textDiscountValue = '%';

  constructor(
    private manageDiscountsService: ManageDiscountsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
    private dialogService: DialogService,
    private offCanvasService: OffCanvasService,
    private imageCropper: ImageCropperService
  ) {
    this.LIST_DATE = this.manageDiscountsService.getListDate();
    this.LIST_SCOPE = this.manageDiscountsService.getListScope();
    this.LIST_DISCOUNT_TYPE = this.manageDiscountsService.getListDiscountType();
  }

  ngOnInit(): void {
    this.getAllDiscounts();
    this.initForm();
    this.idColW = this.fitByChars(this.rows, 'id');
  }

  ngAfterViewInit(): void {
  }

  initForm() {
    this.discountForm = this.fb.group({
      id: [null],
      code: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      scope: ['ORDER', Validators.required],
      discountType: ['PERCENT', Validators.required],
      discountValue: ['', Validators.required],
      minOrderValue: ['', Validators.required],
      maxDiscount: ['', Validators.required],
      active: [true],
      stackable: [true],
      // priority: [''],
      usageLimit: [''],
      usedCount: [''],
      maxUsagePerUser: [''],
      startDate: [''],
      endDate: [''],
      dayOfWeek: [''],
      userId: [''],
      startTime: [''],
      endTime: [''],
      segmentCode: [''],
      paymentMethod: [''],
      regionCode: [''],
    });
  }

  getAllDiscounts() {
    this.manageDiscountsService.getAllDiscounts()
      .subscribe({
        next: (res) => {
          this.temp = [...res.data];
          this.rows = res.data;
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

  onEdit(data: any, template: TemplateRef<any>) {
    this.resetForm();
    this.isEdit = true;
    this.dataEdit = data;
    this.discountForm.patchValue({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      parentId: data.parentId,
      active: data.active,
    });
    this.discountForm.controls.id.disable();
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
          this.manageDiscountsService.deleteDiscountsByID(data.id).pipe(finalize(() => {
            this.offCanvasService.close();
          })).subscribe(response => {
            if (response.code === 200 && response.data) {
              this.alertService.success('Xoá danh mục thành công!');
              this.getAllDiscounts();
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
    this.discountForm.controls.scope.setValue('ORDER');
    this.discountForm.controls.discountType.setValue('PERCENT');
    this.discountForm.controls.active.setValue(true);
    this.discountForm.controls.stackable.setValue(true);
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
      this.discountForm.patchValue({
        id: this.dataEdit.id,
        name: this.dataEdit.name,
        slug: this.dataEdit.slug,
        description: this.dataEdit.description,
        parentId: this.dataEdit.parentId,
        active: this.dataEdit.active,
      });
    } else {
      this.discountForm.reset();
      this.discountForm.controls.active.setValue(true);
    }
    this.discountForm.controls.id.disable();
    this.cdr.detectChanges();
  }

  selectedScope(event: any) {
    const discountTypeValue = this.discountForm.controls.discountType.value;
    if (discountTypeValue === 'AMOUNT') {
      this.textDiscountValue = 'VND';
    } else {
      this.textDiscountValue = '%';
    }
  }

  saveCategory() {
    if (this.isEdit && this.dataEdit) {
      const dataEdit: any = {};
      dataEdit[`id`] = this.dataEdit.id;
      dataEdit[`name`] = this.discountForm.controls.name.value ? this.discountForm.controls.name.value : null;
      dataEdit[`slug`] = this.discountForm.controls.slug.value ? this.discountForm.controls.slug.value : null;
      dataEdit[`description`] = this.discountForm.controls.description.value ? this.discountForm.controls.description.value : null;
      dataEdit[`parentId`] = this.discountForm.controls.parentId.value ? this.discountForm.controls.parentId.value : null;
      dataEdit[`active`] = this.discountForm.controls.active.value ? this.discountForm.controls.active.value : true;
      this.manageDiscountsService.editDiscounts(dataEdit).pipe(finalize(() => {
        this.offCanvasService.close();
      })).subscribe(response => {
        if (response.code === 200 && response.data) {
          this.alertService.success('Chỉnh sửa danh mục thành công!');
          this.getAllDiscounts();
        } else {
          this.alertService.error(response.message);
        }
      }, error => {
        this.alertService.error('Chỉnh sửa danh mục không thành công!');
      });
    } else {
      const dataAdd: any = {};
      dataAdd[`name`] = this.discountForm.controls.name.value ? this.discountForm.controls.name.value : null;
      dataAdd[`slug`] = this.discountForm.controls.slug.value ? this.discountForm.controls.slug.value : null;
      dataAdd[`description`] = this.discountForm.controls.description.value ? this.discountForm.controls.description.value : null;
      dataAdd[`parentId`] = this.discountForm.controls.parentId.value ? this.discountForm.controls.parentId.value : null;
      dataAdd[`active`] = this.discountForm.controls.active.value ? this.discountForm.controls.active.value : true;
      this.manageDiscountsService.createDiscounts(dataAdd).pipe(finalize(() => {
        this.offCanvasService.close();
      })).subscribe(response => {
        if (response.code === 200 && response.data) {
          this.alertService.success('Tạo mới danh mục thành công!');
          this.getAllDiscounts();
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
    this.discountForm.controls.id.disable();
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
