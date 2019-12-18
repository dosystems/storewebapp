import { Directive, ElementRef, Input} from '@angular/core';

@Directive ({
  selector: '[dropzone]'
})

export class DropzoneUpload {
  $el: any;

  constructor(el: ElementRef) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit(): void {
    let dropzone = new Dropzone(this.$el[0], {
      addRemoveLinks: true
    });
    Dropzone.autoDiscover = false;
   // Dropzone.options.myAwesomeDropzone = false;
  }

}
