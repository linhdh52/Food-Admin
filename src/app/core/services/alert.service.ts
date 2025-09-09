import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

export type ToastOpts = {
  title: string;
  icon?: SweetAlertIcon;
  position?: SweetAlertPosition;
  timer?: number;
  showProgress?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  private baseToast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  /** Fire 1 toast với tuỳ chọn linh hoạt */
  fire({ title, icon = 'success', position, timer, showProgress }: ToastOpts) {
    return this.baseToast.fire({
      title,
      icon,
      ...(position ? { position } : {}),
      ...(timer != null ? { timer } : {}),
      ...(showProgress != null ? { timerProgressBar: showProgress } : {})
    });
  }

  success(title: string, position: SweetAlertPosition = 'top-end', timer = 3000) {
    return this.fire({ title, icon: 'success', position, timer });
  }
  error(title: string, position: SweetAlertPosition = 'top-end', timer = 4000) {
    return this.fire({ title, icon: 'error', position, timer });
  }
  info(title: string, position: SweetAlertPosition = 'top-end', timer = 3000) {
    return this.fire({ title, icon: 'info', position, timer });
  }
  warning(title: string, position: SweetAlertPosition = 'top-end', timer = 3000) {
    return this.fire({ title, icon: 'warning', position, timer });
  }
}
