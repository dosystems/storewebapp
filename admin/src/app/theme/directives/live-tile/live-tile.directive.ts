import { Directive, ElementRef } from '@angular/core';
import 'metrojs/release/MetroJs.Full/MetroJs';

@Directive ({
  selector: '[live-tile]'
})

export class LiveTile {
  $el: any;

  constructor(el: ElementRef) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit(): void {
    this.$el
      .css('height', this.$el.data('height'))
      .liveTile();
  }
}
