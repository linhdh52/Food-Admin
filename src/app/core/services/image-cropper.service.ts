import {Injectable} from '@angular/core';
import {NgbOffcanvas, NgbOffcanvasOptions} from '@ng-bootstrap/ng-bootstrap';
import {ImageCropperComponent} from "../shared/component/image-cropper/image-cropper.component";

export type ImageCropperResult = { fileName: string; fileBase64: string };
export type ImageCropperOptions = {
  fileName?: string;
  presetKey?: 'square600' | 'banner169' | 'thumb43' | 'avatar400';
  offcanvas?: NgbOffcanvasOptions;
};

@Injectable({providedIn: 'root'})
export class ImageCropperService {
  constructor(private offcanvas: NgbOffcanvas) {
  }

  open(options: ImageCropperOptions = {}): Promise<ImageCropperResult> {
    const ref = this.offcanvas.open(ImageCropperComponent, {
      position: 'end',
      backdrop: true,
      scroll: true,
      container: 'body',
      panelClass: 'offcanvas-half-centered',
      ...(options.offcanvas || {}),
    });

    const cmp = ref.componentInstance as ImageCropperComponent;
    cmp.defaultFileName = options.fileName ?? 'image.png';
    if (options.presetKey) cmp.selectedPresetKey = options.presetKey as any;

    return ref.result as Promise<ImageCropperResult>;
  }
}
