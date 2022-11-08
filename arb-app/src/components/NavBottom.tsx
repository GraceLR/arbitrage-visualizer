import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    AppBar,
    Toolbar,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Button,
    Avatar,
    Tooltip,
    FormControl,
    InputLabel,
    NativeSelect,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import ArbsDropdown from './ArbsDropdown';
import StatusDropdown from './StatusDropdown';
import { Arb } from '../types/types';

const pages = ['Products', 'Pricing', 'Blog'];
const settings = ['Harmony', 'Phantum'];

function NavBottom(props: {
    arbs: Arb[];
    setSelected: React.Dispatch<React.SetStateAction<any>>;
    statusSelected: string;
    setStatusSelected: React.Dispatch<React.SetStateAction<any>>;
}) {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
        null
    );
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    return (
        <Container maxWidth={false} sx={{ backgroundColor: '#fff' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '0.5vw',
                        }}
                    >
                        <Tooltip title="Open settings">
                            <IconButton
                                onClick={handleOpenUserMenu}
                                sx={{ p: 0 }}
                            >
                                <MenuIcon fontSize="large" />
                            </IconButton>
                        </Tooltip>
                        <Typography
                            sx={{
                                color: 'rgba(0, 0, 0, 0.54)',
                                fontWeight: 600,
                                fontSize: 20,
                                alignSelf: 'center',
                            }}
                        >
                            CHAINS
                        </Typography>
                    </Box>
                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        {settings.map((setting) => (
                            <MenuItem
                                key={setting}
                                onClick={handleCloseUserMenu}
                            >
                                <Typography textAlign="center">
                                    {setting}
                                </Typography>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
                <Box sx={{ display: 'flex', gap: '1.5vw' }}>
                    {props.statusSelected === 'static' &&
                        props.arbs.length > 0 && (
                            <ArbsDropdown
                                arbs={props.arbs}
                                setSelected={props.setSelected}
                            />
                        )}
                    <StatusDropdown
                        setStatusSelected={props.setStatusSelected}
                    />
                </Box>
            </Toolbar>
        </Container>
    );
}

export default NavBottom;
