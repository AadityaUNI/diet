import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Profile', value: 'profile', icon: <PersonIcon /> },
  { label: 'Create For You', value: 'create', icon: <AutoAwesomeIcon />, hero: true },
  { label: 'Saved', value: 'saved', icon: <BookmarkIcon /> },
];

function PillIcon({
  children,
  active,
  hero,
}: {
  children: React.ReactNode;
  active: boolean;
  hero?: boolean;
}) {
  if (hero) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 32,
          borderRadius: '50%',
          // Raised glowing circle for the hero action
          bgcolor: active ? '#4F7EFF' : '#233260',
          boxShadow: active
            ? '0 0 0 4px rgba(79,126,255,0.2), 0 6px 24px rgba(79,126,255,0.55)'
            : '0 2px 10px rgba(10,16,36,0.5)',
          mb: '2px',
          position: 'relative',
          transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
          '& .MuiSvgIcon-root': {
            fontSize: '1.4rem',
            color: active ? '#fff' : '#6B82A8',
            filter: active ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
            transition: 'color 0.25s ease, filter 0.25s ease',
          },
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 30,
        borderRadius: '15px',
        bgcolor: active ? 'rgba(79,126,255,0.15)' : 'transparent',
        mb: '3px',
        transition: 'background-color 0.25s ease',
        '& .MuiSvgIcon-root': {
          fontSize: '1.3rem',
          filter: active ? 'drop-shadow(0 0 7px rgba(79,126,255,0.65))' : 'none',
          transform: active ? 'scale(1.1)' : 'scale(1)',
          transition: 'filter 0.25s ease, transform 0.25s ease',
        },
      }}
    >
      {children}
    </Box>
  );
}

export default function BottomNav() {
  const [value, setValue] = React.useState('create');
  const navigate = useNavigate()

  const handleChange = (_e: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    navigate(`/${newValue}`)
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        bgcolor: '#1A2844',
        height: 68,
        boxShadow: '0 -1px 0 rgba(79,126,255,0.2), 0 -8px 32px rgba(10,16,36,0.65)',

        '& .MuiBottomNavigationAction-root': {
          color: '#6B82A8',
          minWidth: 0,
          padding: '8px 0 10px',
          overflow: 'visible',
          transition: 'color 0.25s ease',

          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            opacity: 1,
            marginTop: 0,
            '&.Mui-selected': { fontSize: '0.68rem' },
          },
        },

        '& .MuiBottomNavigationAction-root.Mui-selected': {
          color: '#4F7EFF',
        },
      }}
    >
      {NAV_ITEMS.map(({ label, value: v, icon, hero }) => (
        <BottomNavigationAction
          key={v}
          label={label}
          value={v}
          icon={
            <PillIcon active={value === v} hero={hero}>
              {icon}
            </PillIcon>
          }
          sx={
            hero
              ? {
                  // Hero label sits below the floating circle, needs nudge down
                  '& .MuiBottomNavigationAction-label': {
                    position: 'relative',
                    top: 3, // diff from top border of navbar
                    // White when active so it pops against the dark bar
                    color: value === v ? '#fff' : '#6B82A8',
                    '&.Mui-selected': { fontSize: '0.68rem', color: '#fff' },
                  },
                }
              : {}
          }
        />
      ))}
    </BottomNavigation>
  );
}