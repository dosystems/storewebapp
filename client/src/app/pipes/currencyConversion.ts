import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'currencyConvertor' })
export class currencyConversionPipe implements PipeTransform {
  transform(items: any[], selectedCurrency: string): any[] {
    if (!items) return [];
    if (!selectedCurrency) return items;
    return items.filter(it => {
      let array = Object.keys(it);
      if (array[0] == selectedCurrency) {
        return it;
      }
    });
  }
}