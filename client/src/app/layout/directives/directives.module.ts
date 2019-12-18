import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlimScroll } from './slim-scroll/slim-scroll.directive';
import { Widget } from './widget/widget.directive';
import { Counter } from './counter/counter.directive';
import { ProgressAnimate } from './progress-animate/progress-animate.directive';
import { DropzoneUpload } from './dropzone/dropzone.directive';

@NgModule({
    imports: [ 
        CommonModule 
    ],
    declarations: [ 
        SlimScroll,
        Widget,
        Counter,
        ProgressAnimate,
        DropzoneUpload
    ],
    exports: [ 
        SlimScroll,
        Widget,
        Counter,
        ProgressAnimate,
        DropzoneUpload
    ]
})
export class DirectivesModule { }
