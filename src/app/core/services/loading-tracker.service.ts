import {Injectable} from "@angular/core";
import {NgxSpinnerService} from "ngx-spinner";

@Injectable({providedIn: 'root'})
export class LoadingTrackerService {
  private active = 0;
  private showTimer?: number;
  private shownAt = 0;
  private isShown = false;

  private readonly SHOW_DELAY = 150;
  private readonly MIN_VISIBLE = 300;

  constructor(private spinner: NgxSpinnerService) {
  }

  start() {
    if (this.active++ === 0) {
      // Lần đầu có request: hẹn lịch show có delay
      this.clearShowTimer();
      this.showTimer = window.setTimeout(() => {
        // Nếu sau delay vẫn còn request → show
        if (this.active > 0 && !this.isShown) {
          this.spinner.show();
          this.isShown = true;
          this.shownAt = Date.now();
        }
      }, this.SHOW_DELAY);
    }
  }

  stop() {
    if (--this.active <= 0) {
      this.active = 0;

      if (!this.isShown) {
        this.clearShowTimer();
        return;
      }

      const elapsed = Date.now() - this.shownAt;
      const remaining = this.MIN_VISIBLE - elapsed;
      if (remaining > 0) {
        window.setTimeout(() => this.hideNow(), remaining);
      } else {
        this.hideNow();
      }
    }
  }

  private hideNow() {
    if (this.isShown) {
      this.spinner.hide();
      this.isShown = false;
      this.shownAt = 0;
    }
  }

  private clearShowTimer() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
  }
}
