import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Node } from '../types/types';

function Graph(props: { selected: number }) {
    const [cycle, setCycle] = useState<Node[]>([]);
    useEffect(() => {
        axios.get<Node[]>(`/api/arbs/${props.selected}`).then((all) => {
            setCycle((_prev) => all.data);
        });
    }, [props.selected]);
    return <div>{/* {cycle.map(n => n.node_name)} */}</div>;
}

export default Graph;
