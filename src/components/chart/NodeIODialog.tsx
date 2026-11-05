import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import {
  VariableType
} from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';

export type NodeIODirection = 'input' | 'output';

const variableTypes: VariableType[] = ['int', 'float', 'str', 'list'];

export function NodeIODialog({
  open,
  direction,
  existingNames,
  onClose,
  onSave
}: {
  open: boolean;
  direction: NodeIODirection | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (name: string, type: VariableType) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<VariableType>('str');

  useEffect(() => {
    if (open) {
      setName('');
      setType('str');
    }
  }, [open, direction]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName && !existingNames.includes(trimmedName)) {
      onSave(trimmedName, type);
    }
  };
  const nameAlreadyExists = existingNames.includes(name.trim());

  return (
    <Dialog
      aria-labelledby="node-io-dialog-title"
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle id="node-io-dialog-title">
        Add {direction ?? 'variable'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={event => setName(event.target.value)}
            autoFocus
            fullWidth
            required
            error={nameAlreadyExists}
            helperText={nameAlreadyExists ? 'This name already exists' : ''}
          />
          <FormControl fullWidth>
            <InputLabel id="node-io-type-label">Type</InputLabel>
            <Select
              labelId="node-io-type-label"
              label="Type"
              value={type}
              onChange={event => setType(event.target.value as VariableType)}
            >
              {variableTypes.map(variableType => (
                <MenuItem key={variableType} value={variableType}>
                  {variableType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={name.trim() === '' || nameAlreadyExists}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
