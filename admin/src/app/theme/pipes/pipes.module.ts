import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppPicturePipe } from './appPicture/appPicture.pipe';
import { ProfilePicturePipe } from './profilePicture/profilePicture.pipe';
import { MailSearchPipe } from './search/mail-search.pipe';
import { SearchPipe } from './search/search.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
    imports: [ 
        CommonModule 
    ],
    declarations: [
        AppPicturePipe, 
        ProfilePicturePipe,
        MailSearchPipe,
        SearchPipe,
        SafeHtmlPipe
    ],
    exports: [
        AppPicturePipe,
        ProfilePicturePipe,
        MailSearchPipe,
        SearchPipe,
        SafeHtmlPipe
    ]
})
export class PipesModule { }
