import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ColumnMode, DatatableComponent, NgxDatatableModule, SortType} from '@siemens/ngx-datatable';


export interface DataTableColumn {
  name: string;
  prop: string;
  width?: number;
  flexGrow?: number;
  sortable?: boolean;
  canAutoResize?: boolean;
  draggable?: boolean;
  resizeable?: boolean;
  headerClass?: string | string[];
  cellClass?: string | string[] | ((row: any) => string);
}


export type SearchMode = 'AND' | 'OR';


@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDatatableModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
// ===== Data & Columns =====
  private _allRows: any[] = [];

  @Input() set rows(v: any[]) {
    this._allRows = Array.isArray(v) ? v : [];
    this.applyFilter();
  }

  get rows() {
    return this._allRows;
  }


  /** Column configs */
  @Input() columns: DataTableColumn[] = [];


  /** Map: prop -> TemplateRef for custom cell render */
  @Input() cellTemplates?: Record<string, TemplateRef<any>>;


// ===== Table behavior =====
  @Input() loading = false;
  @Input() limit = 10;
  @Input() footerHeight = 50;
  @Input() headerHeight = 50;
  @Input() rowHeight: number | 'auto' = 'auto';
  @Input() columnMode: ColumnMode = ColumnMode.force;
  @Input() sortType: SortType = SortType.single;


// ===== Global filter =====
  @Input() enableGlobalFilter = true;
  @Input() placeholder = 'Tìm kiếm (có/không dấu)…';
  @Input() filterMode: SearchMode = 'AND'; // 'AND' | 'OR'
  @Input() caseSensitive = false;
  @Input() noDiacritics = true; // Vietnamese: strip diacritics
  /** Keys to search. Default = columns.map(c => c.prop) */
  @Input() filterKeys?: string[];
  @Input() query = '';


// ===== Outputs =====
  @Output() rowActivate = new EventEmitter<any>();
  @Output() page = new EventEmitter<any>();
  @Output() sort = new EventEmitter<any>();


// ===== View state =====
  viewRows: any[] = [];
  ColumnMode = ColumnMode; // expose enum for template


// ===== Utils =====
  private viNorm(val: any): string {
    if (val == null) return '';
    let s = String(val);
    if (!this.caseSensitive) s = s.toLowerCase();
    if (this.noDiacritics) {
      s = s.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
    }
    return s.replace(/\s+/g, ' ').trim();
  }

  getByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc: any, k) => (acc != null ? acc[k] : undefined), obj) ?? '';
  }


  applyFilter() {
    const keys = (this.filterKeys && this.filterKeys.length)
      ? this.filterKeys
      : this.columns.map(c => c.prop);


    const q = this.viNorm(this.query);
    const tokens = q.split(' ').filter(Boolean);


    if (!tokens.length) {
      this.viewRows = this._allRows;
      return;
    }


    this.viewRows = this._allRows.filter(row => {
      const hay = keys.map(k => this.viNorm(this.getByPath(row, k))).join(' ');
      return this.filterMode === 'AND'
        ? tokens.every(t => hay.includes(t))
        : tokens.some(t => hay.includes(t));
    });
  }


  tplFor(prop: string): TemplateRef<any> | null {
    return this.cellTemplates?.[prop] ?? null;
  }
}
