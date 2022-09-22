import { useState } from 'react';
import Modal from './Modal';
import ModalPortal from './ModalPortal';
import { CSSTransition } from 'react-transition-group';
import './styles.css';

const Content = (props: { showModal: any; setShowModal: any }) => {
    const onClickHandler = () => {
        props.setShowModal(false);
    };

    return (
        <ModalPortal show={props.showModal} onClick={onClickHandler}>
            <CSSTransition
                mountOnEnter
                unmountOnExit
                in={props.showModal}
                timeout={{ enter: 700, exit: 700 }}
                classNames="modal"
            >
                <Modal onClick={onClickHandler} />
            </CSSTransition>
        </ModalPortal>
    );
};

export default Content;
