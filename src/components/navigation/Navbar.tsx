import { IconButton, Typography, AppBar, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export const Navbar = ({ onMenuClick, title = 'Panel de control' }: NavbarProps) => {
  return (
    <AppBar
      position="sticky"
      sx={{
        display: { xs: 'flex', md: 'none' },
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

