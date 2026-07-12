export type TabId =
  | 'dashboard'
  | 'coordinates'
  | 'raycast'
  | 'polyzones'
  | 'doorlocks'
  | 'props'
  | 'markers'
  | 'measurements'
  | 'clipboard'
  | 'utilities'
  | 'history'
  | 'settings'
  | 'debug'
  | 'performance';

export type NotifyType = 'success' | 'error' | 'info' | 'warning';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface CoordinatesData {
  coords: Vec3;
  heading: number;
  street: string;
  zone: string;
  vehicle?: { entity: number; model: number; plate: string };
  entityId: number;
  model: number;
  weapon: number;
  interior: number;
  playerId: number;
  fps?: number;
  ping?: number;
  resourceCount?: number;
  dimension?: number;
}

export interface RaycastData {
  hit: boolean;
  entity: number;
  coords: Vec3;
  normal: Vec3;
  distance: number;
  entityType: string;
  model: number;
  modelName: string;
  plate?: string;
  frozen?: boolean;
  enabled?: boolean;
}

export interface PropItem {
  id: number;
  model: number;
  modelName: string;
  coords: Vec3;
  heading: number;
  frozen: boolean;
}

export interface MarkerItem {
  id: number;
  coords: Vec3;
  type: number;
}

export interface MeasurementData {
  points: Vec3[];
  count: number;
  distance: number;
  horizontal: number;
  height: number;
  slope: number;
  area: number;
  total?: number;
}

export interface HistoryEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: number;
}

export interface PerformanceData {
  fps: number;
  frameTimeMs: number;
  ping: number;
  resourceCount: number;
  memoryMb: number;
}

export interface Job {
  name: string;
  label: string;
}

export type DoorFormat = 'qb' | 'esx' | 'qbox';

export interface DoorLock {
  id: number;
  objName: string;
  objHash: number;
  objYaw: number;
  objCoords: Vec3;
  textCoords: Vec3;
  authorizedJobs: string[];
  locked: boolean;
  pickable: boolean;
  distance: number;
}

export interface ZoneData {
  id: string;
  name: string;
  type: string;
  center?: Vec3;
  heading?: number;
  length?: number;
  width?: number;
  radius?: number;
  points?: { x: number; y: number }[];
  minZ?: number;
  maxZ?: number;
  color?: { r: number; g: number; b: number; a: number };
}

export interface ClipboardEntry {
  id: string;
  text: string;
  format: string;
  timestamp: number;
  pinned?: boolean;
}

export interface UISettings {
  accentColor: string;
  opacity: number;
  fontSize: number;
  performanceMode: boolean;
  developerMode: boolean;
  autosave: boolean;
  autosaveInterval: number;
  showNotifications: boolean;
  notifyOnCopy: boolean;
  confirmDeletions: boolean;
  compactMode: boolean;
  raycastDistance: number;
  overlayScale: number;
}

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  docked: 'none' | 'left' | 'right';
}

export interface Toast {
  id: string;
  message: string;
  type: NotifyType;
}

export interface NuiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  text?: string;
}
