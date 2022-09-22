import { useState } from 'react';
// import './styles.css';

const Modal = (props: { onClick: any }) => {
    return (
        <div className="modal">
            <h2>This is modal</h2>
            <button className="button" onClick={props.onClick}>
                Close
            </button>
        </div>
    );
};

export default Modal;
