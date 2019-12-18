import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'appPicture'})
export class AppPicturePipe implements PipeTransform {

  transform(input:string):string {
    return '../assets/img/' + input;
  }
}