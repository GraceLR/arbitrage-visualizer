import React, { useState, useEffect } from 'react';
import { Arb } from '../types/types';
// import axios from 'axios';

import DropdownItem from './DropdownItem';

function Dropdown(props: {arbs: Arb[], selected: number, setSelected: React.Dispatch<React.SetStateAction<any>>}) {  
    const optionsBar = props.arbs.map((arb) => <DropdownItem key={arb.id} arb={arb} />);
    return <select value={props.selected} onChange={(event) => props.setSelected(parseInt(event.target.value))}>
        {optionsBar}
    </select>
}

export default Dropdown;