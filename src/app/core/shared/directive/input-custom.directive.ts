import {Directive, ElementRef, HostListener, Input,} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[input-global]',
  standalone: true
})

export class InputCustomDirective {
  inputElement: HTMLInputElement;
  @Input() isNoSpace: boolean = false;
  @Input() isAutoUpper: boolean = false;
  @Input() iAccents: boolean = false;
  @Input() isContent: boolean = false;
  @Input() isNoVi: boolean = false;
  @Input() isVi: boolean = false;
  @Input() isNoCharSpen: boolean = false;
  @Input() isSwift: boolean = false;
  @Input() isNoCharSpen2: boolean = false;
  @Input() isMoney: boolean = false;

  constructor(public el: ElementRef, public ngControl: NgControl) {
    this.inputElement = el.nativeElement;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): any {
    if (this.isNoSpace && e.key === ' ') {
      e.preventDefault();
      return;
    }
  }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    return this.removeCharacters(event, false);
  }

  @HostListener('change', ['$event']) onChange(event: any) {
    return this.removeCharacters(event, true);
  }

  removeCharacters(event: any, isTrim: boolean = false) {
    let initalValue = this.inputElement.value;

    if (!initalValue) {
      initalValue = '';
    }

    let newValue = null;
    if (this.iAccents === true) { // khong cho nhap mot so ky tu dac biet
      newValue = initalValue.replace(/[~!@#$%^&*]+/g, '');
    } else {
      if (this.isContent === true) { // khong cho nhap ky tu dac biet
        newValue = initalValue
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/Đ/g, 'D')
          .replace(/đ/g, 'd')
          .replace(/\^|\\|\[|\]|_|`/g, '').replace(/[^aA-zZ0-9 .,\-]+/g, '')
      } else {
        newValue = initalValue.replace(/[~!@#$%^\[\]{}|<>?"_=*ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+/g, '');
      }
    }
    if (this.isMoney === true) { // khong cho nhap ky tu dac biet
      newValue = initalValue
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D')
        .replace(/đ/g, 'd')
        .replace(/\^|\\|\[|\]|_|`/g, '').replace(/[^0-9.\-]+/g, '')
    }

    if (this.isNoCharSpen2 === true) { // khong cho nhap ky tu dac biet
      newValue = initalValue
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D')
        .replace(/đ/g, 'd')
        .replace(/\^|\\|\[|\]|_|`/g, '').replace(/[^0-9 .,\-]+/g, '')
    }

    if (this.isSwift == true) {
      newValue = initalValue.replace(/[~!@#$%^&*`\[\]{}\\|+]+/g, '');
    }
    if (this.isNoVi == true) {
      newValue = initalValue
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[~!@#$%^&*]+/g, '')
        .replace(/\^|\\|\[|\]|_|`/g, '')
        .replace(/[^aA-zZ0-9.,()+-]+/g, '');
    }
    // Không nhập ký tự đặc biệt
    if (this.isVi === true) {
      newValue = initalValue.replace(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]+/g, '');
    }

    if (this.isNoCharSpen === true) {
      newValue = initalValue
        .replace(/[~!@#$%^&';:\[\]{}\\|<>\/?"_=*ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+/g, '');
    }
    if (this.isAutoUpper) {
      newValue = newValue.toUpperCase();
    }
    if (isTrim) {
      newValue = newValue.replace(/[\t\n\r]/g, "").trim();
    }
    this.ngControl.control?.setValue(newValue)

  }
}
