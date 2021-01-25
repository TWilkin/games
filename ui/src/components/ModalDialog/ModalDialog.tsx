import React, { Ref } from 'react';

interface ModalDialogProps {
    submit: string;
    cancel: string;
    form?: Ref<any>;
    onClose: () => void;
    children: JSX.Element | JSX.Element[]
}

const ModalDialog = ({ submit, cancel, form, onClose, children }: ModalDialogProps): JSX.Element => {
    const onCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        onClose();
    };

    return (
        <div className='modal'>
            <div className='modal__content'>
                <button className='modal__close' onClick={onCancel}>&times;</button>

                {children}

                <div className='modal__controls'>
                    <button name={submit} ref={form}>
                        {submit}
                    </button>
                    <button name={cancel} onClick={onCancel}>
                        {cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDialog;
