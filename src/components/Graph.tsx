import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Graph(props: {selected: number}) {
    const [cycle, setCycle] = useState([]);
    useEffect(() => {
        axios.get(`/api/arbs/${props.selected}`)
        .then(all => {
            setCycle(_prev => all.data.rows);
        });
      }, [props.selected]);
    return <div>
        {cycle}
    </div>;
}

export default Graph;