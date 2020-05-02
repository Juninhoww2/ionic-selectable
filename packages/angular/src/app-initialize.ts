
import { NgZone } from '@angular/core';
import { applyPolyfills, defineCustomElements } from 'test-isc/loader';
import { raf } from './util';

let didInitialize = false;

export const appInitialize = (doc: Document, zone: NgZone) => {
  return (): any => {
    const win: Window | undefined = doc.defaultView as any;
    if (win && typeof (window as any) !== 'undefined') {
      if (didInitialize) {
        console.warn('Ionic Angular was already initialized. Make sure IonicModule.forRoot() is just called once.');
      }
      didInitialize = true;

      const aelFn = '__zone_symbol__addEventListener' in (doc.body as any)
        ? '__zone_symbol__addEventListener'
        : 'addEventListener';

      return applyPolyfills().then(() => {
        return defineCustomElements(win, {
          exclude: ['ion-tabs', 'ion-tab'],
          syncQueue: true,
          raf,
          jmp: (h: any) => zone.runOutsideAngular(h),
          ael(elm, eventName, cb, opts) {
            (elm as any)[aelFn](eventName, cb, opts);
          },
          rel(elm, eventName, cb, opts) {
            elm.removeEventListener(eventName, cb, opts);
          }
        });
      });
    }
  };
};