import React, { useContext, useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';

import { updateSearchParams } from './ListFilter';
import { useCatalogueList } from '../../hooks/use-catalogue-list';
import { ISharingScope } from '../../naavre-common/types/NaaVRECatalogue/BaseAssets';
import { SettingsContext } from '../../settings';
import { FormLabel } from '@mui/material';

interface ICheckboxFilter {
  key: string;
  title: string;
  section: string | null;
  checked: boolean;
  getSearchParams: (checked: boolean) => {
    [p: string]: string | null;
  };
}

interface ICheckboxFiltersSection {
  key: string | null;
  title: string | null;
  checkboxFilters: ICheckboxFilter[];
}

const defaultCheckboxFilters: ICheckboxFilter[] = [
  {
    key: 'all_versions',
    title: 'All versions',
    section: null,
    checked: true,
    getSearchParams: checked => ({
      all_versions: checked ? 'true' : 'false',
      page: null
    })
  },
  {
    key: 'shared_with_me',
    title: 'Shared with me',
    section: null,
    checked: true,
    getSearchParams: checked => ({
      shared_with_me: checked ? 'true' : 'false',
      page: null
    })
  }
];

const sharingScopeURLRegExp = /^.*sharing-scopes\/([^/]+)\/?$/;

const sectionTitles: { [k: string]: string } = {
  community: 'Communities',
  virtual_lab: 'Virtual labs'
};

function getSharingScopesAsCheckboxFilters(
  sharingScopes: ISharingScope[],
  activeSharingScopes: Set<string>,
  setActiveSharingScopes: any
): ICheckboxFilter[] {
  return sharingScopes.map((s: ISharingScope) => {
    const key = s.url.replace(sharingScopeURLRegExp, '$1');
    return {
      key: key,
      title: s.title,
      section: s.label,
      checked: false,
      getSearchParams: (checked: boolean) => {
        const newActiveSharingScopes = activeSharingScopes;
        checked
          ? newActiveSharingScopes.add(key)
          : newActiveSharingScopes.delete(key);
        setActiveSharingScopes(newActiveSharingScopes);
        return {
          shared_with_scopes: Array.from(newActiveSharingScopes).join(','),
          page: null
        };
      }
    };
  });
}

function getCheckboxFiltersAsSections(
  checkboxFilters: ICheckboxFilter[]
): ICheckboxFiltersSection[] {
  const sections = Array.from(new Set(checkboxFilters.map(f => f.section)));
  sections.sort((a, b) => {
    if (a === null && b === null) {
      return 0;
    }
    if (a === null) {
      return -1;
    }
    if (b === null) {
      return 1;
    }
    return a.localeCompare(b);
  });
  return sections.map(s => ({
    key: s,
    title: (s !== null && sectionTitles[s]) || null,
    checkboxFilters: checkboxFilters.filter(f => f.section === s)
  }));
}

export function ListFilterCheckboxes({
  setUrl
}: {
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const settings = useContext(SettingsContext);

  // All checkbox filters
  const [checkboxFilters, setCheckboxFilters] = useState<ICheckboxFilter[]>(
    defaultCheckboxFilters
  );

  // Checkbox filters organized by sections
  const [checkboxFiltersBySection, setCheckboxFiltersBySection] = useState<
    ICheckboxFiltersSection[]
  >([]);

  // Sharing scopes from the catalogue
  const { response: sharingScopesResponse } = useCatalogueList<ISharingScope>({
    settings,
    initialPath: 'sharing-scopes/'
  });

  // Keys of the active sharing scopes.  Keeping them in a separate state makes it easier to
  // update the URL search params in the .getSearchParams of individual checkbox filters.
  const [activeSharingScopes, setActiveSharingScopes] = useState<Set<string>>(
    new Set([])
  );

  const { virtualLab } = useContext(SettingsContext);

  // Additional checkboxFilters that depend on context
  useEffect(() => {
    const extraCheckboxFilters: ICheckboxFilter[] = [
      {
        key: 'virtual_lab',
        title: 'All virtual labs',
        section: null,
        checked: true,
        getSearchParams: checked => ({
          virtual_lab: checked ? null : virtualLab || null,
          page: null
        })
      }
    ];
    setCheckboxFilters(checkboxFilters => [
      ...extraCheckboxFilters,
      ...checkboxFilters.filter(
        f => !extraCheckboxFilters.some(d => d.key === f.key)
      )
    ]);
  }, [virtualLab]);

  // Updates checkboxFilters when sharingScopesResponse changes, i.e. when getting the response from the catalogue
  useEffect(() => {
    setCheckboxFilters(checkboxFilters => [
      ...checkboxFilters,
      ...getSharingScopesAsCheckboxFilters(
        sharingScopesResponse.results,
        activeSharingScopes,
        setActiveSharingScopes
      ).filter(f => !checkboxFilters.some(d => d.key === f.key))
    ]);
  }, [sharingScopesResponse, activeSharingScopes, setActiveSharingScopes]);

  // Update checkboxFiltersBySection when checkboxFilters change
  useEffect(() => {
    setCheckboxFiltersBySection(getCheckboxFiltersAsSections(checkboxFilters));
  }, [checkboxFilters]);

  // Call setUrl when checkboxFilter changes
  useEffect(() => {
    checkboxFilters.forEach(filter => {
      setUrl((url: string | null) =>
        updateSearchParams(url, filter.getSearchParams(filter.checked))
      );
    });
  }, [checkboxFilters]);

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
          {checkboxFiltersBySection.map(section => (
            <FormGroup key={section.key}>
              <FormLabel component="legend" sx={{ textDecoration: 'bold' }}>
                {section.title}
              </FormLabel>
              {section.checkboxFilters.map(filter => (
                <FormControlLabel
                  key={filter.key}
                  label={filter.title}
                  control={
                    <Checkbox
                      checked={filter.checked}
                      onChange={e => {
                        setCheckboxFilters(checkboxFilters => {
                          const newCheckboxFilters = [...checkboxFilters];
                          newCheckboxFilters[
                            newCheckboxFilters.findIndex(
                              x => x.key === filter.key
                            )
                          ].checked = e.target.checked;
                          return newCheckboxFilters;
                        });
                      }}
                    />
                  }
                />
              ))}
            </FormGroup>
          ))}
        </FormGroup>
      </Popover>
    </>
  );
}
