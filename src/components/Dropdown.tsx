import React, { useState, useEffect } from 'react';
import { Arb } from '../types/types';
// import axios from 'axios';

import DropdownItem from './DropdownItem';

function Dropdown(props: {arbs: Arb[]}) {  
    const optionsBar = props.arbs.map((arb) => <DropdownItem key={arb.id} arb={arb} />);
    const [selected, setSelected] = useState(props.arbs[0].id);
    return <select value={selected} onChange={(event) => setSelected(parseInt(event.target.value))}>
        {optionsBar}
    </select>
}

export default Dropdown;