import React, { useEffect, useState } from 'react';
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
import { NaaVREExternalService } from '@naavre/communicator-jupyterlab';

const BUILD_STATUS_POLL_INTERVAL_MS = 10000;

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
  const [job, setJob] = useState<IContainerizationJob | null | undefined>(
    cell.containerization_job
  );

  useEffect(() => {
    setJob(cell.containerization_job);
  }, [cell]);

  useEffect(() => {
    if (!job || job.status === 'completed') {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const resp = await NaaVREExternalService(
          'GET',
          cell.url,
          { accept: 'application/json' },
          {}
        );
        const updatedCell: ICell = JSON.parse(resp.content);
        if (!cancelled) {
          setJob(updatedCell.containerization_job);
        }
      } catch (error) {
        console.error('Failed to refresh build status', error);
      }
    };

    const intervalId = setInterval(poll, BUILD_STATUS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [job, cell.url]);

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
