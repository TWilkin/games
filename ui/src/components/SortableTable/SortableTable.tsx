import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Model } from '../../models';

interface SortableTableProps<TModel extends Model> {
    title: string;
    headings: string[];
    sortColumns: (keyof TModel | null)[];
    data: TModel[];
    row: (data: TModel) => JSX.Element[];
}

interface CurrentSort<TModel extends Model> {
    by: keyof TModel;
    direction: boolean;
}

export default function SortableTable<TModel extends Model>(
    { title, headings, sortColumns, data, row }: SortableTableProps<TModel>
): JSX.Element {
    const [ currentSort, setCurrentSort ] = useState<CurrentSort<TModel>>({
        by: sortColumns[0],
        direction: true
    });

    const onHeadingClick = (column: keyof TModel) => 
        setCurrentSort({
            by: column,
            direction: column === currentSort.by ? !currentSort.direction : currentSort.direction
        });

    const renderSortableHeading = (heading: string, column: keyof TModel) => {
        const sort = column != null;
        const sortedByThis = column === currentSort.by;
        const directionIcon = currentSort.direction ? faSortUp : faSortDown;
    
        return (
            <th key={heading} 
                className='button' 
                onClick={() => onHeadingClick(column)}
            >
                {heading}
                {sort && sortedByThis && (
                    <>
                        {' '}
                        <FontAwesomeIcon icon={directionIcon} />
                    </>
                )}
            </th>
        );
    };

    const sort = (field1: TModel, field2: TModel) => {
        const str1 = field1[currentSort.by]?.toString();
        const str2 = field2[currentSort.by]?.toString();
    
        let order = str1 == str2 ? 0 : str1 < str2 ? -1 : 1;
    
        if(!currentSort.direction) {
            order *= -1;
        }
    
        return order;
    };

    return (
        <table>
            <thead>
                <tr>
                    <th colSpan={headings.length}>{title}</th>
                </tr>

                <tr>
                    {headings.map((heading, i) => 
                        renderSortableHeading(heading, sortColumns[i])
                    )}
                </tr>
            </thead>

            <tbody>
                {data
                    .sort(sort)
                    .map((data, i) => {
                        const cells = row(data);
                        return cells ? (
                            <tr key={i}>
                                {cells.map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                ))}
                            </tr>
                        ) : null;
                    })
                }
            </tbody>
        </table>
    );
}
