LVToolsPolyzones = {}

local zones = {}
local editing = false
local editState = nil

---@return boolean
function LVToolsPolyzones.IsEditing()
    return editing
end

---@return table[]
function LVToolsPolyzones.GetAll()
    local result = {}
    for _, zone in pairs(zones) do
        result[#result + 1] = zone
    end
    return result
end

---@param data table
---@return table
function LVToolsPolyzones.HandleAction(data)
    local action = data.action

    if action == 'create' then
        editing = true
        editState = {
            id = ('zone_%d'):format(GetGameTimer()),
            name = data.name or 'New Zone',
            type = data.zoneType or LVToolsZoneType.BOX,
            center = nil,
            heading = GetEntityHeading(PlayerPedId()),
            length = Config.DefaultZone.length,
            width = Config.DefaultZone.width,
            radius = Config.DefaultZone.radius,
            points = {},
            minZ = Config.DefaultZone.minZ,
            maxZ = Config.DefaultZone.maxZ,
            color = { r = 59, g = 130, b = 246, a = 120 },
        }
        return { success = true, editing = editState }

    elseif action == 'cancel' then
        editing = false
        editState = nil
        return { success = true }

    elseif action == 'addPoint' then
        if not editState then return { success = false } end
        local ray = LVToolsRaycast.GetData()
        editState.points[#editState.points + 1] = { x = ray.coords.x, y = ray.coords.y }
        editState.center = ray.coords
        return { success = true, editing = editState }

    elseif action == 'update' then
        if not editState then return { success = false } end
        for k, v in pairs(data.changes or {}) do
            editState[k] = v
        end
        return { success = true, editing = editState }

    elseif action == 'save' then
        if not editState then return { success = false } end
        zones[editState.id] = LVTools.DeepCopy(editState)
        editing = false
        TriggerServerEvent('lv-tools:server:save', 'zones', zones)
        LVToolsNUI.Notify(('Zone saved: %s'):format(editState.name), LVToolsNotifyType.SUCCESS)
        editState = nil
        return { success = true, data = { zones = LVToolsPolyzones.GetAll() } }

    elseif action == 'delete' then
        zones[data.id] = nil
        TriggerServerEvent('lv-tools:server:save', 'zones', zones)
        return { success = true, data = { zones = LVToolsPolyzones.GetAll() } }

    elseif action == 'clear' then
        zones = {}
        TriggerServerEvent('lv-tools:server:save', 'zones', zones)
        LVToolsNUI.Notify('Cleared all zones', LVToolsNotifyType.INFO)
        return { success = true, data = { zones = LVToolsPolyzones.GetAll() } }

    elseif action == 'export' then
        return { success = true, data = json.encode(zones) }

    elseif action == 'import' then
        local ok, parsed = pcall(json.decode, data.json or '{}')
        if ok and type(parsed) == 'table' then
            zones = parsed
            return { success = true, data = { zones = LVToolsPolyzones.GetAll() } }
        end
        return { success = false, error = 'Invalid JSON' }

    elseif action == 'generateLua' then
        if not data.id or not zones[data.id] then
            return { success = false }
        end
        return { success = true, lua = LVToolsPolyzones.GenerateLua(zones[data.id]) }
    end

    return { success = false, error = 'Unknown action' }
end

---@param zone table
---@return string
function LVToolsPolyzones.GenerateLua(zone)
    if zone.type == LVToolsZoneType.BOX then
        local c = zone.center or { x = 0, y = 0, z = 0 }
        return ([[
BoxZone:Create(vector3(%.2f, %.2f, %.2f), %.2f, %.2f, {
    name = %q,
    heading = %.2f,
    minZ = %.2f,
    maxZ = %.2f,
    debugPoly = false,
})]]):format(c.x, c.y, c.z, zone.length, zone.width, zone.name, zone.heading, zone.minZ, zone.maxZ)
    elseif zone.type == LVToolsZoneType.CIRCLE then
        local c = zone.center or { x = 0, y = 0, z = 0 }
        return ([[
CircleZone:Create(vector3(%.2f, %.2f, %.2f), %.2f, {
    name = %q,
    useZ = true,
    debugPoly = false,
})]]):format(c.x, c.y, c.z, zone.radius, zone.name)
    elseif zone.type == LVToolsZoneType.POLY then
        local lines = { 'PolyZone:Create({' }
        for _, p in ipairs(zone.points or {}) do
            lines[#lines + 1] = ('    vector2(%.2f, %.2f),'):format(p.x, p.y)
        end
        lines[#lines + 1] = ('}, { name = %q, minZ = %.2f, maxZ = %.2f, debugPoly = false })'):format(
            zone.name, zone.minZ, zone.maxZ
        )
        return table.concat(lines, '\n')
    end
    return '-- Unsupported zone type'
end

---Draw zone preview while editing.
local function DrawPreview()
    if not editing or not editState then return end

    local ray = LVToolsRaycast.GetData()
    local coords = vector3(ray.coords.x, ray.coords.y, ray.coords.z)
    local color = editState.color or { r = 59, g = 130, b = 246, a = 120 }

    if editState.type == LVToolsZoneType.BOX then
        DrawMarker(28, coords.x, coords.y, coords.z - 0.98,
            0, 0, 0, 0, 0, editState.heading,
            editState.length, editState.width, 0.1,
            color.r, color.g, color.b, color.a,
            false, false, 2, false, nil, nil, false)
    elseif editState.type == LVToolsZoneType.CIRCLE then
        local h = math.max(0.1, editState.maxZ - editState.minZ)
        DrawMarker(1, coords.x, coords.y, coords.z + editState.minZ + h / 2 - 1,
            0, 0, 0, 0, 0, 0,
            editState.radius * 2, editState.radius * 2, h,
            color.r, color.g, color.b, color.a,
            false, false, 2, false, nil, nil, false)
    end

    for i, p in ipairs(editState.points or {}) do
        local nextP = editState.points[i + 1]
        if nextP then
            DrawLine(p.x, p.y, coords.z, nextP.x, nextP.y, coords.z, color.r, color.g, color.b, 255)
        end
    end
end

function LVToolsPolyzones.Tick()
    if not LVToolsState.IsModuleActive('polyzones') and not editing then
        return
    end
    DrawPreview()
end

---Load zones from server payload.
---@param payload table
function LVToolsPolyzones.Load(payload)
    if type(payload) == 'table' then
        zones = payload
    end
end

RegisterNetEvent('lv-tools:client:zonesLoaded', function(payload)
    LVToolsPolyzones.Load(payload)
    LVToolsNUI.Send('zonesUpdate', LVToolsPolyzones.GetAll())
end)
