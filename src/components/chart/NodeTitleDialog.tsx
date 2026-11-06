import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export function NodeTitleDialog({
  open,
  title,
  onClose,
  onSave
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: (title: string) => void;
}) {
  const [value, setValue] = useState(title);

  useEffect(() => {
    if (open) {
      setValue(title);
    }
  }, [open, title]);

  const trimmedTitle = value.trim();

  return (
    <Dialog
      aria-labelledby="node-title-dialog-title"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="node-title-dialog-title">Modify title</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            value={value}
            onChange={event => setValue(event.target.value)}
            autoFocus
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={trimmedTitle === ''}
          onClick={() => onSave(trimmedTitle)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
