import { Injectable, TemplateRef } from '@angular/core';
import {
  NgbOffcanvas,
  NgbOffcanvasOptions,
  NgbOffcanvasRef
} from '@ng-bootstrap/ng-bootstrap';

export type OffCanvasHandlers = {
  onClose?: (result: any) => void;
  onDismiss?: (reason: any) => void;
};

@Injectable({ providedIn: 'root' })
export class OffCanvasService {
  private lastRef?: NgbOffcanvasRef;

  constructor(private ngbOffcanvas: NgbOffcanvas) {}

  open(
    template: TemplateRef<any>,
    options: NgbOffcanvasOptions = {},
    handlers?: OffCanvasHandlers
  ): NgbOffcanvasRef {
    const ref = this.ngbOffcanvas.open(template, {
      position: 'end',
      backdrop: true,
      scroll: true,
      container: 'body',
      panelClass: 'offcanvas-half-centered',
      ...options
    });
    this.lastRef = ref;

    if (handlers?.onClose || handlers?.onDismiss) {
      ref.result
        .then(res => handlers?.onClose?.(res))
        .catch(reason => handlers?.onDismiss?.(reason));
    }

    return ref;
  }

  openAsPromise(
    template: TemplateRef<any>,
    options: NgbOffcanvasOptions = {}
  ): Promise<any> {
    const ref = this.open(template, options);
    return ref.result;
  }

  close(result?: any): void {
    this.lastRef?.close(result);
    this.lastRef = undefined;
  }

  dismiss(reason?: any): void {
    this.lastRef?.dismiss(reason);
    this.lastRef = undefined;
  }

  setBeforeDismiss(predicate: () => boolean | Promise<boolean>): void {
    if (this.lastRef) {
      this.lastRef!.componentInstance;
    }
  }

  isOpen(): boolean {
    return !!this.lastRef;
  }

  getRef(): NgbOffcanvasRef | undefined {
    return this.lastRef;
  }
}
