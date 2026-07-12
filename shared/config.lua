Config = {}

-- Resource identity
Config.ResourceName = 'lv-tools'
Config.OpenKey = 'F7'
Config.CommandPaletteKey = 'F8'

-- Framework detection: 'auto' | 'qbcore' | 'qbox' | 'esx' | 'standalone'
Config.Framework = 'auto'

-- Resource names per framework (override if you renamed the resource)
Config.Frameworks = {
    qbcore = { resource = 'qb-core' },
    qbox   = { resource = 'qbx_core' },
    esx    = { resource = 'es_extended' },
}

-- Permission system: ace | qbcore | qbox | esx | license | standalone | auto
-- 'auto' uses the detected framework's admin check. Ace admins always pass.
Config.PermissionMode = 'ace'
Config.AcePermission = 'lv-tools.access'
Config.QBCorePermission = 'admin' -- qb-core permission level
Config.QboxPermission = 'admin'   -- qbox ace group (group.<value>)
Config.ESXPermission = 'admin'    -- esx group

-- License whitelist (used when PermissionMode = 'license')
Config.Licenses = {
    -- ['license:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'] = true,
}

-- Standalone mode allows everyone (dev servers only!)
Config.StandaloneAllowAll = false

-- General
Config.Decimals = 2
Config.DefaultZone = {
    length = 3.0,
    width = 3.0,
    radius = 2.0,
    minZ = -1.0,
    maxZ = 2.0,
}

-- Performance tuning
Config.UpdateRates = {
    dashboard = 500,
    coordinates = 250,
    raycast = 100,
    polyzones = 0,
    idle = 1000,
}

Config.Raycast = {
    distance = 50.0,
    drawLine = true,
    drawMarker = true,
    drawCrosshair = true,
}

Config.Debug = {
    entityIds = false,
    vehicleIds = false,
    zoneNames = false,
    heading = false,
    collision = false,
    boundingBoxes = false,
}

-- Data persistence paths (relative to resource)
Config.DataPaths = {
    zones = 'data/zones.json',
    props = 'data/props.json',
    coordinates = 'data/coordinates.json',
    clipboard = 'data/clipboard.json',
}

-- Door lock creator (qb-doorlocks)
Config.Doorlock = {
    captureKey = 'E',      -- capture the aimed door while in Aim mode
    exitKey = 'BACK',      -- exit Aim mode
    defaultDistance = 1.5,
    defaultLocked = true,
    defaultPickable = false,
}

-- Job list source for the Door Lock creator.
--   source = 'auto'   -> pull live jobs from the detected framework
--   source = 'manual' -> always use Config.Jobs.list below
-- 'list' is also used as a fallback when the framework returns nothing.
Config.Jobs = {
    source = 'auto',
    list = {
        { name = 'police', label = 'Police' },
        { name = 'ambulance', label = 'EMS' },
        { name = 'mechanic', label = 'Mechanic' },
        { name = 'realestate', label = 'Real Estate' },
    },
}

-- Reverse lookup so captured doors get a proper objName (falls back to objHash).
Config.DoorNames = {
    [`v_ilev_ph_gendoor002`] = 'v_ilev_ph_gendoor002',
    [`v_ilev_ph_gendoor003`] = 'v_ilev_ph_gendoor003',
    [`v_ilev_ph_gendoor004`] = 'v_ilev_ph_gendoor004',
    [`v_ilev_ph_gendoor005`] = 'v_ilev_ph_gendoor005',
    [`v_ilev_gtdoor01`] = 'v_ilev_gtdoor01',
    [`v_ilev_gtdoor02`] = 'v_ilev_gtdoor02',
    [`hei_v_ilev_bk_gate2_pris`] = 'hei_v_ilev_bk_gate2_pris',
    [`hei_v_ilev_bk_vaultdoor`] = 'hei_v_ilev_bk_vaultdoor',
    [`v_ilev_bank1door01`] = 'v_ilev_bank1door01',
    [`v_ilev_bank1door02`] = 'v_ilev_bank1door02',
    [`v_ilev_bank4door01`] = 'v_ilev_bank4door01',
    [`v_ilev_cbankvaulddoor01`] = 'v_ilev_cbankvaulddoor01',
    [`prop_gate_prison_01`] = 'prop_gate_prison_01',
    [`hei_prop_station_gate`] = 'hei_prop_station_gate',
    [`v_ilev_rc_door2`] = 'v_ilev_rc_door2',
    [`v_ilev_fib_door1`] = 'v_ilev_fib_door1',
    [`prop_fnclink_03gate5`] = 'prop_fnclink_03gate5',
    [`prop_ld_int_safe_01`] = 'prop_ld_int_safe_01',
    [`v_ilev_fh_frontdoor`] = 'v_ilev_fh_frontdoor',
    [`v_ilev_fh_backdoor`] = 'v_ilev_fh_backdoor',
    [`v_ilev_fh_backdoor2`] = 'v_ilev_fh_backdoor2',
    [`v_ilev_janm_door01l`] = 'v_ilev_janm_door01l',
    [`v_ilev_janm_door01r`] = 'v_ilev_janm_door01r',
    [`v_ilev_carmod3door`] = 'v_ilev_carmod3door',
    [`lr_prop_carmod_door_l`] = 'lr_prop_carmod_door_l',
    [`prop_com_ls_door_01`] = 'prop_com_ls_door_01',
    [`v_ilev_ta_dryerdoor`] = 'v_ilev_ta_dryerdoor',
    [`v_ilev_shrdoor`] = 'v_ilev_shrdoor',
    [`v_ilev_cs_door01`] = 'v_ilev_cs_door01',
    [`v_ilev_247door`] = 'v_ilev_247door',
}

-- UI defaults pushed to NUI on open
Config.UI = {
    accentColor = '#3b82f6',
    opacity = 0.95,
    fontSize = 14,
    performanceMode = false,
    developerMode = true,
    autosave = true,
    autosaveInterval = 30000,
}
