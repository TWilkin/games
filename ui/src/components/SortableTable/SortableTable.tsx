import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';

interface SortableTableProps<T> {
    title: string;
    headings: string[];
    sortColumns: (keyof T | null)[];
    data: T[];
    row: (data: T) => JSX.Element[];
}

interface SortableTableState<T> {
    sortBy: keyof T;
    ascending: boolean;
}

export default class SortableTable<T> extends Component<SortableTableProps<T>, SortableTableState<T>> {
    constructor(props: SortableTableProps<T>) {
        super(props);

        this.state = {
            sortBy: this.props.sortColumns[0],
            ascending: true
        };

        this.renderSortableHeading = this.renderSortableHeading.bind(this);
        this.sort = this.sort.bind(this);
        this.onSortClick = this.onSortClick.bind(this);
    }

    render() {
        const columns = this.props.headings.length;

        return (
            <table>
                <thead>
                    <tr>
                        <th colSpan={columns}>{this.props.title}</th>
                    </tr>

                    <tr>
                        {this.props.headings.map((heading, i) => 
                            this.renderSortableHeading(heading, this.props.sortColumns[i])
                        )}
                    </tr>
                </thead>

                <tbody>
                    {this.props.data
                        .sort(this.sort)
                        .map((data, i) => {
                            let cells = this.props.row(data);
                            if(cells) {
                                return (
                                    <tr key={i}>
                                        {cells.map((cell, j) => (
                                            <td key={j}>{cell}</td>
                                        ))}
                                    </tr>
                                )
                            }

                            return null;
                        })
                    }
                </tbody>
            </table>
        );
    }

    private renderSortableHeading(heading: string, column: keyof T) {
        const sort = column != null;
        const sortedByThis = column == this.state.sortBy;
        const directionIcon = this.state.ascending ? faSortUp : faSortDown;

        return (
            <th key={heading} className='button' onClick={() => this.onSortClick(column)}>
                {heading}
                {sort && sortedByThis ? (
                    <>
                        {' '}
                        <FontAwesomeIcon icon={directionIcon} />
                    </>
                ) : null}
            </th>
        );
    }

    private sort(field1: T, field2: T) {
        const key = this.state.sortBy as keyof T;

        let str1 = field1[key]?.toString();
        let str2 = field2[key]?.toString();

        let order = str1 == str2 ? 0 : str1 < str2 ? -1 : 1;

        if(!this.state.ascending) {
            order *= -1;
        }

        return order;
    }

    private onSortClick(column: keyof T) {
        const changeDirection = column == this.state.sortBy;
        const direction = changeDirection ? !this.state.ascending : this.state.ascending;

        this.setState({
            sortBy: column,
            ascending: direction
        });
    }
};
