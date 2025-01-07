import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

interface IVirtualizedListProps {
  clickAction: (index: number) => void;
  items: [];
}

export function VirtualizedList({ items, clickAction }: IVirtualizedListProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper'
      }}
    >
      {items.map((item, index) => {
        return (
          <ListItem key={index} component="div" disablePadding>
            <ListItemButton
              onClick={() => {
                clickAction(index);
              }}
            >
              <ListItemText
                primary={item['title']}
                primaryTypographyProps={{
                  style: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </Box>
  );
}
