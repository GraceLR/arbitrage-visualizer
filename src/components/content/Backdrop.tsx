// import './styles.css';
const Backdrop = (props: { show: any; onClick: any }) => {
    return props.show ? (
        <div className="backdrop" onClick={props.onClick}></div>
    ) : null;
};

export default Backdrop;
