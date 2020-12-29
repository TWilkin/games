import React, { Component } from 'react';

interface SortableTableProps<T> {
    title: string;
    headings: string[];
    data: T[];
    row: (data: T) => JSX.Element[];
}

export default class SortableTable<T> extends Component<SortableTableProps<T>> {
    render() {
        const columns = this.props.headings.length;

        return (
            <table>
                <thead>
                    <tr>
                        <th colSpan={columns}>{this.props.title}</th>
                    </tr>

                    <tr>
                        {this.props.headings.map(heading => (
                            <th key={heading}>{heading}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {this.props.data.map((data, i) => {
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
                    })}
                </tbody>
            </table>
        )
    }
};
