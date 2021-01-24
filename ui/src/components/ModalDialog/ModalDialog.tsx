import React from 'react';

interface ModalDialogProps {
    submit: string;
    cancel: string;
    visible: boolean;
    onClose: (cancelled: boolean) => void;
    children: JSX.Element[]
}

const ModalDialog = ({ submit, cancel, visible, onClose, children }: ModalDialogProps): JSX.Element => {
    const onCancel = () => onClose(true);
    const onSubmit = () => onClose(false);

    return visible && (
        <div className='modal'>
            <div className='modal-content'>
                <span className='modal-close' onClick={onCancel}>&times;</span>
                {children}
                <div className='controls'>
                    <button onClick={onSubmit}>
                        {submit}
                    </button>
                    <button onClick={onCancel}>
                        {cancel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalDialog;
