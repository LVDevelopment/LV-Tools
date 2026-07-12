import type {
  ClipboardEntry,
  CoordinatesData,
  DoorLock,
  Job,
  MarkerItem,
  MeasurementData,
  PerformanceData,
  PropItem,
  RaycastData,
  UISettings,
  ZoneData,
} from '@/types';

/** Detect if running inside FiveM NUI */
export const isEnvBrowser = !(window as unknown as { invokeNative?: unknown }).invokeNative;

export const MOCK_COORDS: CoordinatesData = {
  coords: { x: -265.42, y: -963.58, z: 31.22 },
  heading: 208.5,
  street: 'Integrity Way / Strawberry Ave',
  zone: 'Pillbox Hill',
  vehicle: { entity: 12345, model: 3078201489, plate: 'LV DEV' },
  entityId: 128,
  model: 1885233650,
  weapon: 453432689,
  interior: 0,
  playerId: 1,
  fps: 120,
  ping: 24,
  resourceCount: 142,
  dimension: 0,
};

export const MOCK_RAYCAST: RaycastData = {
  hit: true,
  entity: 54321,
  coords: { x: -264.12, y: -962.01, z: 31.08 },
  normal: { x: 0.02, y: -0.01, z: 0.99 },
  distance: 4.32,
  entityType: 'object',
  model: 3078201489,
  modelName: '3078201489',
};

export const MOCK_ZONES: ZoneData[] = [
  {
    id: 'zone_demo_1',
    name: 'Demo Box Zone',
    type: 'box',
    center: { x: -265, y: -963, z: 31 },
    heading: 90,
    length: 4,
    width: 3,
    minZ: 30,
    maxZ: 33,
  },
];

export const MOCK_CLIPBOARD: ClipboardEntry[] = [
  {
    id: 'clip_1',
    text: 'vector3(-265.42, -963.58, 31.22)',
    format: 'vector3',
    timestamp: Date.now() - 60000,
  },
  {
    id: 'clip_2',
    text: 'vector4(-265.42, -963.58, 31.22, 208.50)',
    format: 'vector4',
    timestamp: Date.now() - 120000,
    pinned: true,
  },
];

export const MOCK_SETTINGS: UISettings = {
  accentColor: '#3b82f6',
  opacity: 0.95,
  fontSize: 14,
  performanceMode: false,
  developerMode: true,
  autosave: true,
  autosaveInterval: 30000,
  showNotifications: true,
  notifyOnCopy: true,
  confirmDeletions: false,
  compactMode: false,
  raycastDistance: 25,
  overlayScale: 1.0,
};

/** Mutable in-memory state so the browser dev mode feels interactive */
export const mockState = {
  zones: [
    {
      id: 'zone_demo_1',
      name: 'Demo Box Zone',
      type: 'box',
      center: { x: -265, y: -963, z: 31 },
      heading: 90,
      length: 4,
      width: 3,
      minZ: 30,
      maxZ: 33,
    },
  ] as ZoneData[],
  props: [
    {
      id: 1,
      model: 3078201489,
      modelName: 'prop_barrier_work05',
      coords: { x: -265.4, y: -961.2, z: 31.2 },
      heading: 90,
      frozen: false,
    },
  ] as PropItem[],
  markers: [
    { id: 1, coords: { x: -266.1, y: -962.5, z: 31.2 }, type: 1 },
  ] as MarkerItem[],
  measurement: {
    points: [],
    count: 0,
    distance: 0,
    horizontal: 0,
    height: 0,
    slope: 0,
    area: 0,
  } as MeasurementData,
  doors: [
    {
      id: 1,
      objName: 'v_ilev_ph_gendoor004',
      objHash: 1136192341,
      objYaw: 90,
      objCoords: { x: 450.13, y: -986.88, z: 30.69 },
      textCoords: { x: 450.13, y: -986.88, z: 30.69 },
      authorizedJobs: ['police'],
      locked: true,
      pickable: false,
      distance: 1.5,
    },
  ] as DoorLock[],
  nextId: 2,
};

export const MOCK_JOBS: Job[] = [
  { name: 'police', label: 'Police' },
  { name: 'ambulance', label: 'EMS' },
  { name: 'mechanic', label: 'Mechanic' },
  { name: 'doj', label: 'Department of Justice' },
  { name: 'realestate', label: 'Real Estate' },
];

export const MOCK_DOORS: DoorLock[] = [
  {
    id: 1,
    objName: 'v_ilev_ph_gendoor004',
    objHash: 1136192341,
    objYaw: 90,
    objCoords: { x: 450.13, y: -986.88, z: 30.69 },
    textCoords: { x: 450.13, y: -986.88, z: 30.69 },
    authorizedJobs: ['police'],
    locked: true,
    pickable: false,
    distance: 1.5,
  },
];

function buildDoorEntry(d: DoorLock, format = 'qb'): string {
  const jobsArray = `{ ${d.authorizedJobs.map((j) => `'${j}'`).join(', ')} }`;
  const nameLine = d.objName ? `\t\tobjName = '${d.objName}',` : `\t\tobjHash = ${d.objHash},`;

  if (format === 'esx') {
    return [
      '\t{',
      nameLine,
      `\t\tobjYaw = ${d.objYaw.toFixed(1)},`,
      `\t\tobjCoords  = vector3(${d.objCoords.x.toFixed(2)}, ${d.objCoords.y.toFixed(2)}, ${d.objCoords.z.toFixed(2)}),`,
      `\t\ttextCoords = vector3(${d.textCoords.x.toFixed(2)}, ${d.textCoords.y.toFixed(2)}, ${d.textCoords.z.toFixed(2)}),`,
      `\t\tauthorizedJobs = ${jobsArray},`,
      `\t\tlocked = ${d.locked},`,
      `\t\tdistance = ${d.distance.toFixed(1)},`,
      '\t},',
    ].join('\n');
  }

  if (format === 'qbox' || format === 'ox') {
    const groups = `{ ${d.authorizedJobs.map((j) => `${j} = 0`).join(', ')} }`;
    const model = d.objName ? `\`${d.objName}\`` : `${d.objHash}`;
    const name = d.objName || `door_${d.id}`;
    return [
      '\t{',
      `\t\tname = '${name}',`,
      `\t\tcoords = vec3(${d.objCoords.x.toFixed(2)}, ${d.objCoords.y.toFixed(2)}, ${d.objCoords.z.toFixed(2)}),`,
      `\t\tmodel = ${model},`,
      `\t\theading = ${d.objYaw.toFixed(1)},`,
      `\t\tstate = ${d.locked ? 1 : 0},`,
      `\t\tmaxDistance = ${d.distance.toFixed(1)},`,
      `\t\tgroups = ${groups},`,
      `\t\tlockpick = ${d.pickable},`,
      '\t},',
    ].join('\n');
  }

  return [
    '\t{',
    nameLine,
    `\t\tobjYaw = ${d.objYaw.toFixed(1)},`,
    `\t\tobjCoords  = vec3(${d.objCoords.x.toFixed(2)}, ${d.objCoords.y.toFixed(2)}, ${d.objCoords.z.toFixed(2)}),`,
    `\t\ttextCoords = vec3(${d.textCoords.x.toFixed(2)}, ${d.textCoords.y.toFixed(2)}, ${d.textCoords.z.toFixed(2)}),`,
    `\t\tauthorizedJobs = ${jobsArray},`,
    `\t\tlocked = ${d.locked},`,
    `\t\tpickable = ${d.pickable},`,
    `\t\tdistance = ${d.distance.toFixed(1)},`,
    '\t},',
  ].join('\n');
}

export function mockDoorlockAction(data: Record<string, unknown>): { doors: DoorLock[]; text?: string } {
  const action = data.action as string;
  const format = (data.format as string) ?? 'qb';
  if (action === 'capture') {
    mockState.doors.push({
      id: mockState.nextId++,
      objName: 'v_ilev_ph_gendoor005',
      objHash: 987654321,
      objYaw: Math.round(Math.random() * 360),
      objCoords: { x: 450 + Math.random() * 5, y: -987 + Math.random() * 5, z: 30.69 },
      textCoords: { x: 450 + Math.random() * 5, y: -987 + Math.random() * 5, z: 30.69 },
      authorizedJobs: [],
      locked: true,
      pickable: false,
      distance: 1.5,
    });
  } else if (action === 'update') {
    const d = mockState.doors.find((x) => x.id === data.id);
    if (d) Object.assign(d, data.patch as Partial<DoorLock>);
  } else if (action === 'delete') {
    mockState.doors = mockState.doors.filter((d) => d.id !== data.id);
  } else if (action === 'clear') {
    mockState.doors = [];
  } else if (action === 'copy') {
    const d = mockState.doors.find((x) => x.id === data.id);
    return { doors: mockState.doors, text: d ? buildDoorEntry(d, format) : '' };
  } else if (action === 'exportAll') {
    return { doors: mockState.doors, text: mockState.doors.map((d) => buildDoorEntry(d, format)).join('\n') };
  }
  return { doors: mockState.doors };
}

export function mockZoneAction(data: Record<string, unknown>): { zones: ZoneData[] } {
  const action = data.action as string;
  if (action === 'create' || action === 'save') {
    if (action === 'save') {
      mockState.zones.push({
        id: `zone_${Date.now()}`,
        name: `New Zone ${mockState.zones.length + 1}`,
        type: 'box',
        center: { x: -265 + Math.random() * 6, y: -963 + Math.random() * 6, z: 31 },
        heading: Math.floor(Math.random() * 360),
        length: 4,
        width: 3,
        minZ: 30,
        maxZ: 33,
      });
    }
  } else if (action === 'delete') {
    mockState.zones = mockState.zones.filter((z) => z.id !== data.id);
  } else if (action === 'clear') {
    mockState.zones = [];
  }
  return { zones: mockState.zones };
}

export const MOCK_PERFORMANCE: PerformanceData = {
  fps: 118,
  frameTimeMs: 8.4,
  ping: 24,
  resourceCount: 142,
  memoryMb: 74,
};

export function mockPropAction(data: Record<string, unknown>) {
  const action = data.action as string;
  if (action === 'spawn') {
    const id = mockState.nextId++;
    mockState.props.push({
      id,
      model: 0,
      modelName: String(data.model ?? 'prop'),
      coords: { x: -265 + Math.random() * 4, y: -962 + Math.random() * 4, z: 31.2 },
      heading: Math.floor(Math.random() * 360),
      frozen: false,
    });
  } else if (action === 'delete') {
    mockState.props = mockState.props.filter((p) => p.id !== data.id);
  } else if (action === 'freeze') {
    const p = mockState.props.find((x) => x.id === data.id);
    if (p) p.frozen = !p.frozen;
  } else if (action === 'clear') {
    mockState.props = [];
  }
  return { props: mockState.props };
}

export function mockMarkerAction(data: Record<string, unknown>) {
  const action = data.action as string;
  if (action === 'add') {
    mockState.markers.push({
      id: mockState.nextId++,
      coords: { x: -266 + Math.random() * 4, y: -962 + Math.random() * 4, z: 31.2 },
      type: (data.type as number) ?? 1,
    });
  } else if (action === 'delete') {
    mockState.markers = mockState.markers.filter((m) => m.id !== data.id);
  } else if (action === 'clear') {
    mockState.markers = [];
  }
  return { markers: mockState.markers };
}

export function mockMeasurementAction(data: Record<string, unknown>): MeasurementData {
  const action = data.action as string;
  const pts = mockState.measurement.points;
  if (action === 'addPoint') {
    pts.push({ x: -265 + Math.random() * 10, y: -962 + Math.random() * 10, z: 31 + Math.random() * 3 });
  } else if (action === 'undo') {
    pts.pop();
  } else if (action === 'clear') {
    mockState.measurement.points = [];
  }
  const points = mockState.measurement.points;
  const count = points.length;
  let distance = 0;
  let horizontal = 0;
  let height = 0;
  let slope = 0;
  let area = 0;
  if (count >= 2) {
    const a = points[count - 2];
    const b = points[count - 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    distance = +Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2);
    horizontal = +Math.sqrt(dx * dx + dy * dy).toFixed(2);
    height = +Math.abs(dz).toFixed(2);
    slope = horizontal > 0 ? +((Math.atan(Math.abs(dz) / horizontal) * 180) / Math.PI).toFixed(2) : 0;
  }
  if (count >= 3) {
    let a = 0;
    for (let i = 0; i < count; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % count];
      a += p1.x * p2.y - p2.x * p1.y;
    }
    area = +(Math.abs(a) / 2).toFixed(2);
  }
  mockState.measurement = { points, count, distance, horizontal, height, slope, area };
  return mockState.measurement;
}

/** Simulate live data updates in browser dev mode */
export function createMockTicker(onCoords: (d: CoordinatesData) => void, onRaycast: (d: RaycastData) => void) {
  let t = 0;
  const interval = setInterval(() => {
    t += 0.05;
    onCoords({
      ...MOCK_COORDS,
      coords: {
        x: MOCK_COORDS.coords.x + Math.sin(t) * 0.5,
        y: MOCK_COORDS.coords.y + Math.cos(t) * 0.5,
        z: MOCK_COORDS.coords.z,
      },
      heading: (MOCK_COORDS.heading + t * 2) % 360,
      fps: 115 + Math.floor(Math.random() * 10),
      ping: 20 + Math.floor(Math.random() * 8),
    });
    onRaycast({
      ...MOCK_RAYCAST,
      distance: 4 + Math.sin(t) * 0.5,
    });
  }, 250);
  return () => clearInterval(interval);
}
