import {Injectable} from '@angular/core'

@Injectable()
export class MessagesService {

    private _messages = [
        {
            name: 'ashley',
            text: 'After you get up and running, you can place Font Awesome icons just about...',
            time: '1 min ago'
        },
        {
            name: 'michael',
            text: 'You asked, Font Awesome delivers with 40 shiny new icons in version 4.2.',
            time: '2 hrs ago'
        },
        {
            name: 'julia',
            text: 'Want to request new icons? Here\'s how. Need vectors or want to use on the...',
            time: '10 hrs ago'
        },
        {
            name: 'bruno',
            text: 'Explore your passions and discover new ones by getting involved. Stretch your...',
            time: '1 day ago'
        },
        {
            name: 'tereza',
            text: 'Get to know who we are - from the inside out. From our history and culture, to the...',
            time: '1 day ago'
        },
        {
            name: 'adam',
            text: 'Need some support to reach your goals? Apply for scholarships across a variety of...',
            time: '2 days ago'
        },
        {
            name: 'michael',
            text: 'Wrap the dropdown\'s trigger and the dropdown menu within .dropdown, or...',
            time: '1 week ago'
        }
    ];

    private _notifications = [
        {
            name: 'michael',
            text: 'Michael posted a new article.',
            time: '1 min ago'
        },
        {
            name: 'adam',
            text: 'Adam changed his contact information.',
            time: '2 hrs ago'
        },
        {
            image: '../assets/img/shopping-cart.svg',
            text: 'New orders received.',
            time: '5 hrs ago'
        },
        {
            name: 'ashley',
            text: 'Ashley replied to your comment.',
            time: '1 day ago'
        },
        {
            name: 'tereza',
            text: 'Today is Tereza\'s birthday.',
            time: '2 days ago'
        },
        {
            image: '../assets/img/comments.svg',
            text: 'New comments on your post.',
            time: '3 days ago'
        },
        {
            name: 'bruno',
            text: 'Bruno invited you to join the event.',
            time: '1 week ago'
        }
    ];

    private _tasks = [
        {
            text: 'Design some buttons',
            value: '20%',
            class: 'info'
        },
        {
            text:'Create a nice theme',
            value: '40%',
            class: 'danger'
        },
        {
            text: 'Some task I need to do',
            value: '60%',
            class: 'success'
        },
        {
            text: 'Make beautiful transitions',
            value: '80%',
            class: 'warning'
        },
        {
            text: 'Another task I need to do',
            value: '15%',
            class: 'info'
        },
        {
            text: 'Debug and find last bugs',
            value: '55%',
            class: 'danger'
        }
    ];

    public getMessages():Array<Object> {
        return this._messages;
    }

    public getNotifications():Array<Object> {
        return this._notifications;
    }

    public getTasks():Array<Object> {
        return this._tasks;
    }

}