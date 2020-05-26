import React, { Component } from 'react';

import { APIProps } from '../common';
import { Link } from 'react-router-dom';

interface EditButtonProps extends APIProps {
    type: string;
    id: number;
}

export default class EditButton extends Component<EditButtonProps> {

    constructor(props: EditButtonProps) {
        super(props);
    }

    public render() {
        if(this.props.api.user.role == 'admin') {
            return (
                <Link to={`/${this.props.type}/${this.props.id}/editform`}>
                    Edit
                </Link>
            )
        }

        return null;
    }

};
