import ReactDOM from 'react-dom';
import Backdrop from './Backdrop';

const ModalPortal = (props: { show: any; onClick: any; children: any }) => {
    return (
        <>
            {ReactDOM.createPortal(
                <Backdrop show={props.show} onClick={props.onClick} />,
                document.getElementById('backdrop-root')!
            )}
            {ReactDOM.createPortal(
                props.children,
                document.getElementById('overlay-root')!
            )}
        </>
    );
};

export default ModalPortal;
