/** Descriptor containing information about a flow class. */
export declare interface FlowDescriptor {
  readonly name: string;
  readonly friendlyName: string;
  readonly category: string;
  readonly defaultArgs: unknown;
}

/** Map from Flow name to FlowDescriptor. */
export type FlowDescriptorMap = ReadonlyMap<string, FlowDescriptor>;

/** Flow state enum to be used inside the Flow. */
export enum FlowState {
  UNSET = 0,
  RUNNING = 1,
  FINISHED = 2,
  ERROR = 3,
}

/** A Flow is a server-side process that collects data from clients. */
export declare interface Flow {
  readonly flowId: string;
  readonly clientId: string;
  readonly lastActiveAt: Date;
  readonly startedAt: Date;
  readonly name: string;
  readonly creator: string;
  readonly args: unknown|undefined;
  readonly progress: unknown|undefined;
  readonly state: FlowState;
}

/** FlowResult represents a single flow result. */
export declare interface FlowResult {
  readonly payloadType: string;
  readonly payload: unknown;
  readonly tag: string;
  readonly timestamp: Date;
}

/**
 * FlowResultQuery encapsulates details of a flow results query. Queries
 * are used by flow details components to request data to show.
 */
export declare interface FlowResultsQuery {
  readonly flow : {
    readonly clientId: string,
    readonly flowId: string,
    readonly state?: FlowState,
  };
  readonly withTag?: string;
  readonly withType?: string;
  readonly offset?: number;
  readonly count?: number;
}

/** A scheduled flow, to be executed after approval has been granted. */
export declare interface ScheduledFlow {
  readonly scheduledFlowId: string;
  readonly clientId: string;
  readonly creator: string;
  readonly flowName: string;
  readonly flowArgs: unknown;
  readonly createTime: Date;
  readonly error?: string;
}

/** Hex-encoded hashes. */
export declare interface HexHash {
  readonly sha256?: string;
  readonly sha1?: string;
  readonly md5?: string;
}


/** Map from Artifact name to ArtifactDescriptor. */
export type ArtifactDescriptorMap = ReadonlyMap<string, ArtifactDescriptor>;

/** Combine both Artifact and ArtifactDescriptor from the backend */
export interface ArtifactDescriptor {
  readonly name: string;
  readonly doc?: string;
  readonly labels: ReadonlyArray<string>;
  readonly supportedOs: ReadonlySet<OperatingSystem>;
  readonly urls: ReadonlyArray<string>;
  readonly provides: ReadonlyArray<string>;
  readonly sources: ReadonlyArray<ArtifactSource>;
  readonly dependencies: ReadonlyArray<string>;
  readonly pathDependencies: ReadonlyArray<string>;
  readonly isCustom?: boolean;
}

/** SourceType proto mapping. */
export enum SourceType {
  COLLECTOR_TYPE_UNKNOWN,
  FILE,
  REGISTRY_KEY,
  REGISTRY_VALUE,
  WMI,
  ARTIFACT,
  PATH,
  DIRECTORY,
  ARTIFACT_GROUP,
  GRR_CLIENT_ACTION,
  LIST_FILES,
  ARTIFACT_FILES,
  GREP,
  COMMAND,
  REKALL_PLUGIN,
}

/** Operating systems. */
export enum OperatingSystem {
  LINUX = 'Linux',
  WINDOWS = 'Windows',
  DARWIN = 'Darwin',
}

/** Artifact source. */
interface BaseArtifactSource {
  readonly type: SourceType;
  readonly conditions: ReadonlyArray<string>;
  readonly returnedTypes: ReadonlyArray<string>;
  readonly supportedOs: ReadonlySet<OperatingSystem>;
}

/** Generic Map with unknown, mixed, key and value types. */
export type AnyMap = ReadonlyMap<unknown, unknown>;

/** Artifact source that delegates to other artifacts. */
export interface ChildArtifactSource extends BaseArtifactSource {
  readonly type: SourceType.ARTIFACT_GROUP|SourceType.ARTIFACT_FILES;
  readonly names: ReadonlyArray<string>;
}

/** Artifact source that delegates to a ClientAction. */
export interface ClientActionSource extends BaseArtifactSource {
  readonly type: SourceType.GRR_CLIENT_ACTION;
  readonly clientAction: string;
}

/** Artifact source that delegates to a shell command. */
export interface CommandSource extends BaseArtifactSource {
  readonly type: SourceType.COMMAND;
  readonly cmdline: string;
}

/** Artifact source that reads files. */
export interface FileSource extends BaseArtifactSource {
  readonly type: SourceType.DIRECTORY|SourceType.FILE|SourceType.GREP|
      SourceType.PATH;
  readonly paths: ReadonlyArray<string>;
}

/** Artifact source that reads Windows Registry keys. */
export interface RegistryKeySource extends BaseArtifactSource {
  readonly type: SourceType.REGISTRY_KEY;
  readonly keys: ReadonlyArray<string>;
}

/** Artifact source that reads Windows Registry values. */
export interface RegistryValueSource extends BaseArtifactSource {
  readonly type: SourceType.REGISTRY_VALUE;
  readonly values: ReadonlyArray<string>;
}

/** Artifact source that queries WMI. */
export interface WmiSource extends BaseArtifactSource {
  readonly type: SourceType.WMI;
  readonly query: string;
}

/** Unknown artifact source. */
export interface UnknownSource extends BaseArtifactSource {
  readonly type: SourceType.COLLECTOR_TYPE_UNKNOWN;
}

/** Artifact source. */
export type ArtifactSource =
    ChildArtifactSource|ClientActionSource|CommandSource|FileSource|
    RegistryKeySource|RegistryValueSource|WmiSource|UnknownSource;

/** ExecuteRequest proto mapping. */
export declare interface ExecuteRequest {
  readonly cmd: string;
  readonly args: ReadonlyArray<string>;
  readonly timeLimitSeconds: number;
}

/** ExecuteResponse proto mapping. */
export declare interface ExecuteResponse {
  readonly request: ExecuteRequest;
  readonly exitStatus: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timeUsedSeconds: number;
}

/** ArtifactProgress proto mapping. */
export declare interface ArtifactProgress {
  readonly name: string;
  // For legacy reasons, numResults can be unknown.
  readonly numResults?: number;
}

/** ArtifactCollectorFlowProgress proto mapping. */
export declare interface ArtifactCollectorFlowProgress {
  readonly artifacts: ReadonlyMap<string, ArtifactProgress>;
}
