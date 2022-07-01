import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Arb } from '../types/types';

function DropdownItem(props: {arb: Arb}) {
    return <option value={props.arb.id}>{props.arb.block}</option>
}

export default DropdownItem;
