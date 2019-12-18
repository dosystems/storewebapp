import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'Count' })
export class categoriesCountPipe implements PipeTransform {
  transform(allHeroes: any[]) {
    return allHeroes.filter(hero => hero.count>0);
  }
}