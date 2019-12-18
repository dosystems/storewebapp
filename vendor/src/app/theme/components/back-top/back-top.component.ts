import {Component, ViewEncapsulation, ViewChild, HostListener, Input, ElementRef} from '@angular/core';

@Component({
  selector: 'az-back-top',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./back-top.component.scss'],
  template: `
    <i #backTop class="fa fa-angle-up back-to-top" title="Back to Top"></i>
  `
})
export class BackTopComponent {

  @Input() position:number = 400;
  @Input() showSpeed:number = 500;
  @Input() moveSpeed:number = 1000;

  @ViewChild('backTop') private _selector:ElementRef;

  ngAfterViewInit () {
    this._onWindowScroll();
  }

  @HostListener('click')
  _onClick():boolean {
    jQuery('html, body').animate({scrollTop:0}, {duration:this.moveSpeed});
    return false;
  }

  @HostListener('window:scroll')
  _onWindowScroll():void {
    let el = this._selector.nativeElement;
    window.scrollY > this.position ? jQuery(el).fadeIn(this.showSpeed) : jQuery(el).fadeOut(this.showSpeed);
  }
}
