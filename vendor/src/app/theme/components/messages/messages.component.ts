import {Component, ViewEncapsulation} from '@angular/core';

import {MessagesService} from './messages.service';

@Component({
    selector: 'az-messages',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./messages.component.scss'],
    templateUrl: './messages.component.html',
    providers: [MessagesService]
})

export class MessagesComponent{     
    public messages:Array<Object>;
    public notifications:Array<Object>;
    public tasks:Array<Object>;

    constructor (private _messagesService:MessagesService){
        this.messages = _messagesService.getMessages();
        this.notifications = _messagesService.getNotifications();
        this.tasks = _messagesService.getTasks();
    }

}