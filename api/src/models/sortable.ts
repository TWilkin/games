import { Model } from 'sequelize-typescript';

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

export function convertSortValue(value: string): string {
    // always use upper case for simplicity
    let sort = value.toUpperCase();

    // filter any symbols
    sort = sort.replace(/[^0-9A-Z ]/, '');

    // check for 'A ...' and 'The ...'
    if(sort.startsWith('A ')) {
        sort = sort.substring(2) + ', A';
    } else if(sort.startsWith('THE ')) {
        sort = sort.substring(4) + ', THE';
    }

    const split = sort.split(' ');
    sort = split
        // convert roman numerals into numbers
        .map(word => convertNumeral(word))
        .map(word => {
            // if we have a number, pad it with 0s
            let num = parseInt(word);
            if(num) {
                return word.padStart(10, '0');
            }

            return word;
        })
        .join(' ');

    return sort;
}

export default function sortBy(column: string) {
    return function(input1: object, input2: object): number {
        const value1 = convertSortValue(input1[column]);
        const value2 = convertSortValue(input2[column]);
        
        if(value1 > value2) {
            return 1;
        } else if(value1 < value2) {
            return -1;
        }
        return 0;
    }
}

function convertNumeral(numeral: string): string {
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