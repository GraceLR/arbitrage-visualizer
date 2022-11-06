import React, { useState, useEffect } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
const pages = ['Products', 'Pricing', 'Blog'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function NavTop() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
        null
    );
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
        null
    );

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    return (
        <Container
            maxWidth={false}
            sx={{
                backgroundColor: '#435b71',
                minHeight: '3vw',
                maxWidth: null,
            }}
        >
            <Toolbar sx={{ minHeight: '3vw !important' }}>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: { xs: 'none', md: 'flex' },
                    }}
                >
                    {/* {pages.map((page) => (
                        <Button
                            key={page}
                            onClick={handleCloseNavMenu}
                            sx={{
                                my: 2,
                                color: 'white',
                                display: 'block',
                                height: '3vw',
                            }}
                        >
                            {page}
                        </Button>
                    ))} */}
                    hi
                </Box>
                {/* <Box sx={{ flexGrow: 0, minHeight: 20 }}>
                    <Tooltip title="Open settings" sx={{ minHeight: 20 }}>
                        <IconButton
                            onClick={handleOpenUserMenu}
                            sx={{ p: 0, minHeight: 20 }}
                        >
                            <AccountCircleIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px', minHeight: 20 }}
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
                </Box> */}
            </Toolbar>
        </Container>
    );
}

export default NavTop;
