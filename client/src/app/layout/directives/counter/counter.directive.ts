import { Directive, ElementRef, Input } from '@angular/core';

@Directive ({
  selector: '[counter]'
})

export class Counter {
  element: any;
  @Input() count: number;
  @Input() interval: number;
  @Input() increment: number;

  constructor(_elementRef: ElementRef) {
    this.element = jQuery(_elementRef.nativeElement);
  }

  ngAfterViewInit(): void {
      let elem = this.element,
          count = this.count,
          increment = this.increment,
          interval = this.interval;

      function counter(){
          count = count + increment;
          setTimeout(() => counter(), interval * 1000);          
          elem.html(count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      }
      counter();
  }
}
