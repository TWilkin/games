import { Column, DataType, Model } from 'sequelize-typescript';

import { Queryable } from '../api/decorators';
import { AbstractRestrictedModel } from './restrictedmodel';

// the list of Roman numerals and their values
const romanNumerals = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
};

export abstract class AbstractSortableModel<T extends Model<T>> 
        extends AbstractRestrictedModel<T>
{

    @Queryable
    @Column(DataType.STRING)
    title!: string;

    public get sortTitle(): string {
        // always use upper case for simplicity
        let sortTitle = this.title.toUpperCase();

        // filter any symbols
        sortTitle = sortTitle.replace(/[^0-9A-Z ]/, '');

        // check for 'A ...' and 'The ...'
        if(sortTitle.startsWith('A ')) {
            sortTitle = sortTitle.substring(2) + ', A';
        } else if(sortTitle.startsWith('THE ')) {
            sortTitle = sortTitle.substring(4) + ', THE';
        }

        const split = sortTitle.split(' ');
        sortTitle = split
            // convert roman numerals into numbers
            .map(word => this.convertNumeral(word))
            .map(word => {
                // if we have a number, pad it with 0s
                let num = parseInt(word);
                if(num) {
                    return word.padStart(10, '0');
                }

                return word;
            })
            .join(' ');

        return sortTitle;
    }

    public static sort<T extends AbstractSortableModel<T>>(input1: T, input2: T): number {
        const title1 = input1.sortTitle;
        const title2 = input2.sortTitle;
        
        if(title1 > title2) {
            return 1;
        } else if(title1 < title2) {
            return -1;
        }
        return 0;
    }

    private convertNumeral(numeral: string): string {
        if(numeral.match(/^[IVXLCDM]+$/)) {
            let number = 0;
            let last = 'I';
            for(let i = numeral.length - 1; i >= 0; i--) {
                // if the previous value was larger we know it's a 4 or 9
                if(romanNumerals[last] > romanNumerals[numeral[i]]) {
                    number -= romanNumerals[numeral[i]];
                } else {
                    number += romanNumerals[numeral[i]];
                }

                // store the last numeral to handle 4 and 9
                last = numeral[i];
            }
            return number.toString();
        }

        // not a roman numeral
        return numeral;
    }

}
