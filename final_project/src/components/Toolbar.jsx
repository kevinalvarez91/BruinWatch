// import * as React from 'react';
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { Link, useNavigate } from 'react-router-dom';
import bear_with_glasses from '../assets/bear_with_glasses.jpg';
import '../css/Toolbar.css';

const pages = [
  { name: 'Report', path: '/report' },
  { name: 'Contact', path: '/contact' }
];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const navigate = useNavigate(); // for redirection

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // logout button function
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5001/logout", {  // Use correct backend port
        method: "POST",
        credentials: "include",  // Ensures session is properly cleared
      });
      navigate("/login");  // Redirect to login after logging out
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [user, setUser] = useState({
      name: ""
    });
    
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/user', {
          credentials: 'include'
        });
        const text = await response.text();
        if (response.ok) {
          const userData = JSON.parse(text);
          setUser(userData);
        } else {
          setError("Failed to fetch user data");
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        setError("Error connecting to server");
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#7886C7', zIndex: 10 }}>
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters className='menuButton'>
          {/* Logo and Home link for larger screens */}
          <Box sx={{ml:1, display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
            <img 
              src={bear_with_glasses}
              alt="Bear with Glasses"
              className='bearImage'
            />
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/home"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: '#9c3030', // Apply your color here
                textDecoration: 'none',
              }}
            >
              BruinWatch
            </Typography>
          </Box>

          {/* Hamburger menu for smaller screens */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu} 
                  component={Link} 
                  to={page.path}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo for smaller screens */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
              
            <img 
              src={bear_with_glasses}
              alt="Bear with Glasses"
              className='bearImage'
            />
            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/home"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: '#9c3030', // Apply your color here
                textDecoration: 'none',
              }}
            >
              BruinWatch
            </Typography>
          </Box>

          {/* Pages for larger screens */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {pages.map((page, index) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{ my: 2, color: 'white', display: 'block', ml: index > 0 ? 4 : 2}}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* User settings */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ mr: 1 }}>
                <Avatar alt={user.name} src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
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
              {settings.map((setting) => {
                if (setting === 'Profile') {
                  return (
                    <MenuItem 
                      key={setting} 
                      onClick={handleCloseUserMenu} 
                      component={Link} 
                      to="/Profile"
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  );
                } else if (setting === 'Dashboard') {
                  return (
                    <MenuItem 
                      key={setting} 
                      onClick={handleCloseUserMenu} 
                      component={Link} 
                      to="/Dashboard"
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  );
                } else if (setting === 'Logout') {
                  return (
                    <MenuItem 
                      key={setting} 
                      onClick={handleLogout}
                      component={Link} 
                      to="/"
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  );
                }else if (setting === 'Account') {
                  return (
                    <MenuItem 
                      key={setting} 
                      onClick={handleCloseUserMenu} 
                      component={Link} 
                      to="/Account"
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  );
                } 
                else {
                  return (
                    <MenuItem 
                      key={setting} 
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  );
                }
              })}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
