import React, { useState, useEffect } from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';

// import axios from 'axios';

function StatusDropdown(props: {
    setStatusSelected: React.Dispatch<React.SetStateAction<any>>;
}) {
    return (
        <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
                Status
            </InputLabel>
            <NativeSelect
                defaultValue="static"
                inputProps={{
                    name: 'status',
                    id: 'uncontrolled-native',
                }}
                onChange={(event) => {
                    props.setStatusSelected(event.target.value);
                }}
            >
                <option value="static">static</option>
                <option value="live">live</option>
            </NativeSelect>
        </FormControl>
    );
}

export default StatusDropdown;
