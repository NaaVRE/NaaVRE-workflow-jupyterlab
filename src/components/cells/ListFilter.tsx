import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import { useDebouncedValue } from '@mantine/hooks';

function updateSearchParams(
  url: string | null,
  params: { [key: string]: string | null }
): string | null {
  if (url === null) {
    return null;
  }
  const newUrl = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === '') {
      newUrl.searchParams.delete(key);
    } else {
      newUrl.searchParams.set(key, value);
    }
  }
  return newUrl.toString();
}

function SearchField({
  search,
  setSearch
}: {
  search: string | null;
  setSearch: (v: string | null) => void;
}) {
  return (
    <TextField
      value={search}
      onChange={e => setSearch(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={() => setSearch('')}
                edge="end"
                style={{
                  borderRadius: '100%'
                }}
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      }}
      size="small"
      sx={{
        '& .MuiInputBase-root': {
          borderRadius: '100px'
        },
        maxWidth: '100%',
        '&:focus-within': {
          flexShrink: 0
        },
        transition: 'all 0.5s ease'
      }}
    />
  );
}

interface ICheckboxFilter {
  label: string;
  checked: boolean;
}

interface ICheckboxFilters {
  [key: string]: ICheckboxFilter;
}

const defaultCheckboxFilters: ICheckboxFilters = {
  all_versions: {
    label: 'Show all versions',
    checked: false
  }
};

function checkboxFiltersToSearchParams(checkboxFilters: ICheckboxFilters): {
  [key: string]: string;
} {
  return {
    all_versions: checkboxFilters.all_versions.checked ? 'true' : 'false'
  };
}

function CheckboxFiltersMenu({
  checkboxFilters,
  setCheckboxFilters
}: {
  checkboxFilters: ICheckboxFilters;
  setCheckboxFilters: (v: ICheckboxFilters) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'checkboxfilter-popover' : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        aria-label="checkbox-filters"
        style={{
          borderRadius: '100%'
        }}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <FilterListIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
      >
        <FormGroup sx={{ px: 2, py: 1 }}>
          {Object.entries(checkboxFilters).map(([key, filter]) => (
            <FormControlLabel
              key={key}
              label={filter.label}
              control={
                <Checkbox
                  checked={filter.checked}
                  onClick={() => {
                    setCheckboxFilters({
                      ...checkboxFilters,
                      [key]: {
                        ...filter,
                        checked: !filter.checked
                      }
                    });
                  }}
                />
              }
            />
          ))}
        </FormGroup>
      </Popover>
    </>
  );
}

const orderingOptions = [
  { value: 'modified', label: 'First modified' },
  { value: '-modified', label: 'Last modified' },
  { value: 'title', label: 'A-Z' },
  { value: '-title', label: 'Z-A' }
];

function OrderingMenu({
  ordering,
  setOrdering
}: {
  ordering: string | null;
  setOrdering: (v: string | null) => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        id="ordering-button"
        aria-label="ordering"
        aria-controls={open ? 'ordering-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        style={{
          borderRadius: '100%'
        }}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <SwapVertIcon />
      </IconButton>
      <Menu
        id="ordering-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          list: {
            'aria-labelledby': 'ordering-button'
          }
        }}
      >
        {orderingOptions.map(option => (
          <MenuItem
            key={option.value}
            selected={option.value === ordering}
            onClick={() => {
              setOrdering(option.value);
              setAnchorEl(null);
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function ListFilter({
  url,
  setUrl
}: {
  url: string | null;
  setUrl: (u: string | null) => void;
}) {
  const [search, setSearch] = useState<string | null>(null);
  const [checkboxFilters, setCheckboxFilters] = useState<ICheckboxFilters>(
    defaultCheckboxFilters
  );
  const [ordering, setOrdering] = useState<string | null>('-modified');

  const [debouncedSearch] = useDebouncedValue(search, 200);

  useEffect(() => {
    const newUrl = updateSearchParams(url, {
      search: debouncedSearch,
      ordering: ordering,
      page: null,
      ...checkboxFiltersToSearchParams(checkboxFilters)
    });
    setUrl(newUrl);
  }, [debouncedSearch, ordering, checkboxFilters]);

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        justifyContent: 'start',
        alignItems: 'center',
        padding: '10px'
      }}
    >
      <SearchField search={search} setSearch={setSearch} />
      <CheckboxFiltersMenu
        checkboxFilters={checkboxFilters}
        setCheckboxFilters={setCheckboxFilters}
      />
      <OrderingMenu ordering={ordering} setOrdering={setOrdering} />
    </Stack>
  );
}
