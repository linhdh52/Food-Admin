import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbActiveOffcanvas} from '@ng-bootstrap/ng-bootstrap';
import {
  ImageCropperComponent as NgxImageCropperComponent,
  ImageCroppedEvent,
  CropperPosition,
} from 'ngx-image-cropper';

type PresetKey = 'square600' | 'banner169' | 'thumb43' | 'avatar400' | 'rect400x250';

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxImageCropperComponent],
  templateUrl: './image-cropper.component.html',
  styles: [`
    .checkerboard {
      background-image: linear-gradient(45deg, #555 25%, transparent 25%),
      linear-gradient(-45deg, #555 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #555 75%),
      linear-gradient(-45deg, transparent 75%, #555 75%);
      background-size: 16px 16px;
      background-position: 0 0, 0 8px, 8px -8px, -8px 0;
    }

    .shadow-sm {
      box-shadow: 0 .125rem .25rem rgba(0, 0, 0, .075);
    }
  `]
})
export class ImageCropperComponent implements OnDestroy {
  constructor(public off: NgbActiveOffcanvas, private cdr: ChangeDetectorRef) {
  }

  @ViewChild('cropper') cropper!: NgxImageCropperComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() defaultFileName: string = 'image.png';
  @Input() selectedPresetKey: PresetKey = 'square600';

  imageChangedEvent: any = null;

  croppedBase64: string | null = null;
  private croppedBlob: Blob | null = null;
  previewUrl: string | null = null;
  outW = 0;
  outH = 0;
  outBytes = 0;

  fileNameUI: string | null = null;

  aspectRatio = 1;
  targetWidth = 600;
  targetHeight?: number;
  roundCropper = false;

  cropperPosition?: CropperPosition;

  presets: Record<PresetKey, {
    label: string; ratio: number; outW: number; outH?: number; round?: boolean;
  }> = {
    square600: {label: 'Square 1:1 (600×600)', ratio: 1 / 1, outW: 600, outH: 600},
    banner169: {label: 'Banner 16:9 (1280×720)', ratio: 16 / 9, outW: 1280, outH: 720},
    thumb43: {label: 'Thumb 4:3 (800×600)', ratio: 4 / 3, outW: 800, outH: 600},
    avatar400: {label: 'Avatar tròn 1:1 (400×400)', ratio: 1 / 1, outW: 400, outH: 400, round: true},
    rect400x250: {label: 'Rect 400×250', ratio: 400 / 250, outW: 400, outH: 250},
  };
  presetKeys: PresetKey[] = ['square600', 'banner169', 'thumb43', 'avatar400', 'rect400x250'];

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files && input.files[0];
    this.fileNameUI = f ? f.name : null;

    this.imageChangedEvent = ev;
    this.resetOutput();
  }

  onImageLoaded() {
    try {
      this.cropper.resetCropperPosition();
    } catch {
    }
    this.applyPreset();
  }

  onCropped(e: ImageCroppedEvent) {
    this.outW = (e as any).width ?? this.targetWidth ?? 0;
    this.outH = (e as any).height ?? this.targetHeight ?? 0;

    const handleBlob = async (blob: Blob) => {
      const finalBlob = this.roundCropper ? await this.makeCircularImage(blob) : blob;
      this.croppedBlob = finalBlob;
      this.outBytes = finalBlob.size ?? 0;
      this.updatePreviewUrl(finalBlob);
      this.croppedBase64 = await this.blobToBase64(finalBlob);
      this.cdr.detectChanges();
    };

    if (e.blob) {
      handleBlob(e.blob);
    } else if (e.base64) {
      this.base64ToBlob(e.base64).then(handleBlob);
    } else if ((e as any).objectUrl) {
      const url = (e as any).objectUrl as string;
      fetch(url).then(r => r.blob()).then(handleBlob);
    } else {
      this.croppedBlob = null;
      this.croppedBase64 = null;
      this.previewUrl = null;
      this.outBytes = 0;
      this.cdr.detectChanges();
    }
  }

  onLoadImageFailed() {
  }

  clearImage() {
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
    this.fileNameUI = null;
    this.imageChangedEvent = null;
    this.resetOutput();
    this.cdr.detectChanges();
  }

  applyPreset() {
    const p = this.presets[this.selectedPresetKey];
    if (!p) return;
    this.aspectRatio = p.ratio;
    this.targetWidth = p.outW;
    this.targetHeight = p.outH;
    this.roundCropper = !!p.round;
    setTimeout(() => this.centerCropBox(p.ratio), 0);
  }

  applyRound() {
    setTimeout(() => this.centerCropBox(this.aspectRatio), 0);
  }

  private centerCropBox(desiredRatio: number) {
    const imgEl: HTMLElement | undefined = (this.cropper as any)?.sourceImage?.nativeElement;
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();
    const imgW = rect.width, imgH = rect.height;

    let frameW = imgW * 0.8;
    let frameH = frameW / desiredRatio;
    if (frameH > imgH * 0.8) {
      frameH = imgH * 0.8;
      frameW = frameH * desiredRatio;
    }

    const cx = imgW / 2, cy = imgH / 2;
    this.cropperPosition = {
      x1: Math.max(0, cx - frameW / 2),
      y1: Math.max(0, cy - frameH / 2),
      x2: Math.min(imgW, cx + frameW / 2),
      y2: Math.min(imgH, cy + frameH / 2),
    };
    this.cdr.detectChanges();
  }

  private async makeCircularImage(blob: Blob): Promise<Blob> {
    const bitmap = await createImageBitmap(blob);
    const size = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(bitmap, 0, 0, size, size);
    ctx.restore();

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });
  }

  private updatePreviewUrl(blob: Blob) {
    this.revokePreviewUrl();
    this.previewUrl = URL.createObjectURL(blob);
  }

  private revokePreviewUrl() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  private resetOutput() {
    this.revokePreviewUrl();
    this.croppedBase64 = null;
    this.croppedBlob = null;
    this.outW = this.outH = this.outBytes = 0;
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string): Promise<Blob> {
    return fetch(base64).then(res => res.blob());
  }

  private estimateBytesFromBase64(b64: string): number {
    const pure = b64.split(',')[1] ?? '';
    return Math.floor((pure.length * 3) / 4);
  }

  downloadPreview() {
    if (!this.croppedBlob) return;
    const url = this.previewUrl ?? URL.createObjectURL(this.croppedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.defaultFileName;
    a.click();
    if (!this.previewUrl) URL.revokeObjectURL(url);
  }

  async copyBase64() {
    if (!this.croppedBase64) return;
    try {
      await navigator.clipboard.writeText(this.croppedBase64);
    } catch {
    }
  }

  useImage() {
    if (!this.croppedBase64) return;
    this.off.close({fileName: this.defaultFileName, fileBase64: this.croppedBase64});
  }
}
