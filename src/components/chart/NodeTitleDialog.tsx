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
  onSave,
  isTitleAvailable
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave: (title: string) => void | Promise<void>;
  isTitleAvailable: (title: string) => Promise<boolean>;
}) {
  const [value, setValue] = useState(title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(title);
      setTitleError(null);
    }
  }, [open, title]);

  const trimmedTitle = value.trim();

  const saveTitle = async () => {
    setSaving(true);
    setTitleError(null);
    if (trimmedTitle === title) {
      setTitleError('The title has not changed.');
      setSaving(false);
      return;
    }
    let titleAvailable: boolean;
    try {
      titleAvailable = await isTitleAvailable(trimmedTitle);
    } catch (error) {
      console.error('Failed to check draft workflow component title', error);
      setTitleError(
        'Could not check whether this name is available. Please try again.'
      );
      setSaving(false);
      return;
    }

    if (!titleAvailable) {
      setTitleError(
        'A workflow component with this name already exists in the catalogue.'
      );
      setSaving(false);
      return;
    }

    try {
      await onSave(trimmedTitle);
      onClose();
    } catch (error) {
      setTitleError(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      aria-labelledby="node-title-dialog-title"
      open={open}
      onClose={() => {
        if (!saving) {
          onClose();
        }
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="node-title-dialog-title">Edit title</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Title"
            value={value}
            onChange={event => {
              setValue(event.target.value);
              setTitleError(null);
            }}
            autoFocus
            fullWidth
            required
            error={titleError !== null}
            helperText={titleError}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={trimmedTitle === '' || saving}
          onClick={() => void saveTitle()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
