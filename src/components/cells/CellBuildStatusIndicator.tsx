import React from 'react';
import {
  ICell,
  IContainerizationJob
} from '../../naavre-common/types/NaaVRECatalogue/WorkflowCells';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CircularProgress from '@mui/material/CircularProgress';
import { SxProps } from '@mui/material/styles';

const STATUS_LABELS: Record<IContainerizationJob['status'], string> = {
  queued: 'queued',
  in_progress: 'in progress',
  completed: 'completed',
  waiting: 'waiting',
  requested: 'requested',
  pending: 'pending'
};

const CONCLUSION_LABELS: Record<
  NonNullable<IContainerizationJob['conclusion']>,
  string
> = {
  success: 'succeeded',
  failure: 'failed',
  neutral: 'neutral',
  cancelled: 'cancelled',
  skipped: 'skipped',
  timed_out: 'timed out',
  action_required: 'action required'
};

function IndicatorIcon({
  job
}: {
  job: IContainerizationJob | null | undefined;
}) {
  if (!job) {
    return (
      <Tooltip arrow title={'build status unknown'}>
        <QuestionMarkIcon color="action" fontSize="inherit" />
      </Tooltip>
    );
  }

  if (job.status !== 'completed') {
    return (
      <Tooltip arrow title={`build ${STATUS_LABELS[job.status] ?? job.status}`}>
        <CircularProgress
          color="warning"
          disableShrink
          size={12}
          thickness={4}
        />
      </Tooltip>
    );
  }

  const tooltipText = `build ${(job.conclusion && CONCLUSION_LABELS[job.conclusion]) ?? job.conclusion}`;

  if (job.conclusion === 'success') {
    return (
      <Tooltip arrow title={tooltipText}>
        <CheckIcon color="success" fontSize="inherit" />
      </Tooltip>
    );
  }

  return (
    <Tooltip arrow title={tooltipText}>
      <ClearIcon color="error" fontSize="inherit" />
    </Tooltip>
  );
}

export function CellBuildStatusIndicator({
  cell,
  sx
}: {
  cell: ICell;
  sx?: SxProps;
}) {
  const job = cell.containerization_job;
  const href = job?.html_url;

  return (
    <>
      {href ? (
        <Box
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          <IndicatorIcon job={job} />
        </Box>
      ) : (
        <IndicatorIcon job={job} />
      )}
    </>
  );
}
