import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import PersonIcon from '@mui/icons-material/Person';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';

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
          bgcolor: active ? 'var(--primary)' : 'var(--secondary)',
          boxShadow: active
            ? '0 0 0 4px color-mix(in oklch, var(--primary) 20%, transparent), 0 6px 24px color-mix(in oklch, var(--primary) 40%, transparent)'
            : '0 2px 10px color-mix(in oklch, var(--foreground) 12%, transparent)',
          mb: '2px',
          position: 'relative',
          transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
          '& .MuiSvgIcon-root': {
            fontSize: '1.4rem',
            color: active ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            filter: active ? 'drop-shadow(0 0 6px color-mix(in oklch, var(--primary-foreground) 40%, transparent))' : 'none',
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
        bgcolor: active ? 'color-mix(in oklch, var(--primary) 15%, transparent)' : 'transparent',
        mb: '3px',
        transition: 'background-color 0.25s ease',
        '& .MuiSvgIcon-root': {
          fontSize: '1.3rem',
          filter: active ? 'drop-shadow(0 0 7px color-mix(in oklch, var(--primary) 65%, transparent))' : 'none',
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
        bgcolor: 'var(--card)',
        height: 68,
        boxShadow: '0 -1px 0 var(--border), 0 -8px 32px color-mix(in oklch, var(--foreground) 8%, transparent)',

        '& .MuiBottomNavigationAction-root': {
          color: 'var(--muted-foreground)',
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
          color: 'var(--primary)',
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
                  '& .MuiBottomNavigationAction-label': {
                    position: 'relative',
                    top: 3,
                    color: value === v ? 'var(--foreground)' : 'var(--muted-foreground)',
                    '&.Mui-selected': { fontSize: '0.68rem', color: 'var(--foreground)' },
                  },
                }
              : {}
          }
        />
      ))}
    </BottomNavigation>
  );
}
