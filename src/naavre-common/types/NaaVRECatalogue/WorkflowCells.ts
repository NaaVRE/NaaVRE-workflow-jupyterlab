import { IBaseAsset, IAssetVersionsRef } from './BaseAssets';

export interface IBaseImage {
  build: string;
  runtime: string;
}

export interface IContainerizationJob {
  html_url: string;
  status:
    | 'queued'
    | 'in_progress'
    | 'completed'
    | 'waiting'
    | 'requested'
    | 'pending';
  conclusion:
    | 'success'
    | 'failure'
    | 'neutral'
    | 'cancelled'
    | 'skipped'
    | 'timed_out'
    | 'action_required'
    | null;
}

export interface IDependency {
  name: string;
  module?: string | null;
  asname?: string | null;
}

export type VariableType = 'int' | 'float' | 'str' | 'list';

export interface IBaseVariable {
  name: string;
  type: VariableType | null;
}

export interface IInput extends IBaseVariable {}

export interface IOutput extends IBaseVariable {}

export interface IConf {
  name: string;
  assignation: string;
}

export interface IParam extends IBaseVariable {
  default_value?: string;
}

export interface ISecret extends IBaseVariable {}

export interface ICell extends IBaseAsset {
  version?: number;
  versions?: IAssetVersionsRef[];
  container_image: string | null;
  base_container_image?: IBaseImage | null;
  containerization_job?: IContainerizationJob | null;
  containerization_workflow_id?: string | null;
  dependencies: Array<IDependency>;
  inputs: Array<IInput>;
  outputs: Array<IOutput>;
  confs: Array<IConf>;
  params: Array<IParam>;
  secrets: Array<ISecret>;
  kernel?: string;
  source_url?: string;
  is_draft?: boolean;
}
