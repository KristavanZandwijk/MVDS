import React, { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Home as HomeIcon,
  CallMade as CallMadeIcon,
  CallReceived as CallReceivedIcon,
  ContentPasteSearch as ContentPasteSearchIcon,
  GTranslate as GTranslateIcon,
  ManageSearch as ManageSearchIcon,
  PermIdentity as PermIdentityIcon,
  ChevronLeft,
  ChevronRightOutlined,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from 'components/FlexBetween';
import UpscaleLogo from "assets/Upscale.png";

const navItems = [
  { text: "Homepage", icon: <HomeIcon />, path: "/homepage" },
  { text: "Your Connector", icon: null },
  { text: "Provided Data", icon: <CallMadeIcon />, path: "/dataprovider", hasDropdown: true },
  { text: "Received Data", icon: <CallReceivedIcon />, path: "/dataconsumer" },
  { text: "Data space Environment", icon: null },
  { text: "Broker", icon: <ContentPasteSearchIcon />, path: "/broker" },
  { text: "Vocabulary Hub", icon: <GTranslateIcon />, path: "/vocabularyhub" },
  { text: "Observer", icon: <ManageSearchIcon />, path: "/observer" },
  { text: "Store", icon: <CallMadeIcon />, path: "/store" },
  { text: "Your Profile", icon: null },
  { text: "Identity Provider", icon: <PermIdentityIcon />, path: "/identityprovider" },
];

const dropdownOptions = [
  { text: "Offer", path: "/dataprovider/offer" },
  { text: "Catalog", path: "/dataprovider/catalog" },
  { text: "Representation", path: "/dataprovider/representation" },
  { text: "Artifact", path: "/dataprovider/artifact" },
  { text: "Contract", path: "/dataprovider/contract" },
];

const Sidebar = ({ drawerWidth, isSidebarOpen, setIsSidebarOpen, isNonMobile }) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            {/* Header */}
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Typography variant="h4" fontWeight="bold">
                  Construction Data Space
                </Typography>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>

            <List>
              {navItems.map(({ text, icon, path, hasDropdown }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
                      {text}
                    </Typography>
                  );
                }

                const isParentActive = pathname.startsWith(path);

                if (hasDropdown) {
                  return (
                    <Box key={text}>
                      <ListItem disablePadding sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Main navigation area */}
                        <ListItemButton
                          onClick={() => navigate(path)}
                          sx={{
                            flex: 1,
                            backgroundColor: pathname === path ? theme.palette.secondary[300] : "transparent",
                            color: pathname === path ? theme.palette.primary[600] : theme.palette.secondary[100],
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              ml: "2rem",
                              color: pathname === path ? theme.palette.primary[600] : theme.palette.secondary[200],
                            }}
                          >
                            {icon}
                          </ListItemIcon>
                          <ListItemText primary={text} />
                        </ListItemButton>

                        {/* Arrow button */}
                        <IconButton
                          onClick={() => setOpenDropdown(!openDropdown)}
                          sx={{ color: theme.palette.secondary[200], mr: 1 }}
                        >
                          {openDropdown ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </ListItem>

                      {/* Dropdown options */}
                      <Collapse in={openDropdown} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {dropdownOptions.map((option) => {
                            const isActive = pathname === option.path;
                            return (
                              <ListItem key={option.text} disablePadding>
                                <ListItemButton
                                  sx={{
                                    pl: "5rem",
                                    backgroundColor: isActive ? theme.palette.secondary[300] : "transparent",
                                    color: isActive ? theme.palette.primary[600] : theme.palette.secondary[100],
                                  }}
                                  onClick={() => navigate(option.path)}
                                >
                                  <ListItemText primary={option.text} />
                                </ListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    </Box>
                  );
                }

                // Normal item
                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => navigate(path)}
                      sx={{
                        backgroundColor: isParentActive ? theme.palette.secondary[300] : "transparent",
                        color: isParentActive ? theme.palette.primary[600] : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color: isParentActive ? theme.palette.primary[600] : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Footer */}
          <Box position="absolute" bottom="1rem" width="100%">
            <Divider />
            <Box display="flex" justifyContent="center" alignItems="center" m="0.5rem 0">
              <Box
                component="img"
                alt="Upscale Logo"
                src={UpscaleLogo}
                sx={{ width: "90%", height: "auto", objectFit: "contain", px: "1rem" }}
              />
            </Box>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
