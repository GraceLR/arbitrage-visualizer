import React, { useState, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';

import { Arb } from '../types/types';
// import axios from 'axios';

import DropdownItem from './DropdownItem';

function ArbsDropdown(props: {
    arbs: Arb[];
    setSelected: React.Dispatch<React.SetStateAction<any>>;
}) {
    const optionsBar = props.arbs.map((arb) => (
        <DropdownItem key={arb.id} arb={arb} />
    ));
    return (
        <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                Arbitrage
            </InputLabel>
            <NativeSelect
                defaultValue={0}
                inputProps={{
                    name: 'arbitrage',
                    id: 'uncontrolled-native',
                }}
                onChange={(event) => {
                    props.setSelected(event.target.value);
                }}
            >
                {optionsBar}
            </NativeSelect>
        </FormControl>
    );
}

export default ArbsDropdown;
