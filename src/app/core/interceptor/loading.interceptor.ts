import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {finalize} from 'rxjs';
import {LoadingTrackerService} from "../services/loading-tracker.service";

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('skipLoading')) {
    const clean = req.clone({headers: req.headers.delete('skipLoading')});
    return next(clean);
  }

  const tracker = inject(LoadingTrackerService);
  tracker.start();

  return next(req).pipe(finalize(() => tracker.stop()));
};
