import React, { Component } from 'react';

interface ModalDialogProps {
    submit: string;
    cancel: string;
    visible: boolean;
    onClose: (cancelled: boolean) => void;
}

export default class ModalDialog extends Component<ModalDialogProps> {

    constructor(props: ModalDialogProps) {
        super(props);

        this.onCancel = this.onCancel.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    private onCancel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        this.props.onClose(true);
    }

    private onSubmit(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        event.preventDefault();
        this.props.onClose(false);
    }

    public render(): JSX.Element {
        return this.props.visible && (
            <div className='modal'>
                <div className='modal-content'>
                    <span className='modal-close' onClick={this.onCancel}>&times;</span>
                    {this.props.children}
                    <div className='controls'>
                        <button onClick={this.onSubmit}>
                            {this.props.submit}
                        </button>
                        <button onClick={this.onCancel}>
                            {this.props.cancel}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

}
