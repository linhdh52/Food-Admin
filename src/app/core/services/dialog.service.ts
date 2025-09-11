import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor() {}

  showDialog(title: string, text: string, icon: SweetAlertIcon = 'info') {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK'
    });
  }

  confirmDialog(
    title: string,
    htmlMessage: string,
    confirmText: string = '<i class="feather icon-check-square me-1"></i> Đồng ý',
    cancelText: string = '<i class="feather icon-x-circle me-1"></i> Hủy'
  ) {
    return Swal.fire({
      title,
      html: htmlMessage,
      icon: 'question',
      iconColor: '#0d6efd',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm-custom') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel-custom') as HTMLElement;
        [confirmBtn, cancelBtn].forEach(btn => {
          if (btn) {
            btn.style.minWidth = '120px';
            btn.style.display = 'inline-flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.fontWeight = '500';
            btn.style.margin = '0 4px';
          }
        });
      }
    });
  }
}
