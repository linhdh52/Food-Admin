import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxDatatableModule} from '@siemens/ngx-datatable';
import {NgxSpinnerModule} from 'ngx-spinner';
import {ImageCropperComponent} from "ngx-image-cropper";

export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  NgxDatatableModule,
  NgxSpinnerModule,
  ImageCropperComponent
] as const;
