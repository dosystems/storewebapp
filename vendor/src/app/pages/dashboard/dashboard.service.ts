import { Injectable } from '@angular/core';

@Injectable()
export class DashboardService {
    
    weatherData = [
        { day:'Sunday', icon: 'clear-day', degree: '18° / 22°'},
        { day:'Monday', icon: 'partly-cloudy-day', degree: '14° / 16°'},
        { day:'Tuesday', icon: 'cloudy', degree: '8° / 12°'},
        { day:'Wednesday', icon: 'rain', degree: '4° / 6°'},
        { day:'Thursday', icon: 'sleet', degree: '-1° / 3°'},
        { day:'Friday', icon: 'snow', degree: '-3° / -1°'},
        { day:'Saturday', icon: 'fog', degree: '-1° / 2°'}
    ]

    public getWeatherData():Object {
        return this.weatherData;
    }

    
}