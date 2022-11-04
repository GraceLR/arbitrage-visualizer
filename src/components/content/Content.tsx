import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';

const icon = (
    <Paper sx={{ bgcolor: '#c8e6c9', height: '100%' }}>
        <Box component="svg"></Box>
    </Paper>
);

const Content = (props: { contentShow: any }) => {
    return (
        <Collapse orientation="horizontal" in={props.contentShow}>
            {icon}
        </Collapse>
    );
};

export default Content;
