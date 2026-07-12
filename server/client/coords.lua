LVToolsCoords = {}

local cachedNatives = {
    PlayerPedId = PlayerPedId,
    GetEntityCoords = GetEntityCoords,
    GetEntityHeading = GetEntityHeading,
    GetStreetNameAtCoord = GetStreetNameAtCoord,
    GetStreetNameFromHashKey = GetStreetNameFromHashKey,
    GetNameOfZone = GetNameOfZone,
    GetLabelText = GetLabelText,
    GetVehiclePedIsIn = GetVehiclePedIsIn,
    GetEntityModel = GetEntityModel,
    GetSelectedPedWeapon = GetSelectedPedWeapon,
    GetInteriorFromEntity = GetInteriorFromEntity,
    GetPlayerServerId = GetPlayerServerId,
    PlayerId = PlayerId,
    GetGameTimer = GetGameTimer,
}

---@param coords vector3
---@return string
local function GetStreetLabel(coords)
    local streetHash, crossingHash = cachedNatives.GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local streetName = cachedNatives.GetStreetNameFromHashKey(streetHash)
    local crossingName = crossingHash ~= 0 and cachedNatives.GetStreetNameFromHashKey(crossingHash) or nil

    if crossingName and crossingName ~= '' then
        return streetName .. ' / ' .. crossingName
    end

    return streetName or 'Unknown'
end

---@param coords vector3
---@return string
local function GetZoneLabel(coords)
    local zone = cachedNatives.GetNameOfZone(coords.x, coords.y, coords.z)
    local label = cachedNatives.GetLabelText(zone)
    return label ~= 'NULL' and label or zone
end

---@return table
function LVToolsCoords.GetLiveData()
    local ped = cachedNatives.PlayerPedId()
    local coords = cachedNatives.GetEntityCoords(ped)
    local heading = cachedNatives.GetEntityHeading(ped)
    local vehicle = cachedNatives.GetVehiclePedIsIn(ped, false)

    return {
        coords = LVTools.Vec3ToTable(coords),
        heading = LVTools.Round(heading),
        street = GetStreetLabel(coords),
        zone = GetZoneLabel(coords),
        vehicle = vehicle ~= 0 and {
            entity = vehicle,
            model = cachedNatives.GetEntityModel(vehicle),
            plate = GetVehicleNumberPlateText(vehicle),
        } or nil,
        entityId = ped,
        model = cachedNatives.GetEntityModel(ped),
        weapon = cachedNatives.GetSelectedPedWeapon(ped),
        interior = cachedNatives.GetInteriorFromEntity(ped),
        playerId = cachedNatives.GetPlayerServerId(cachedNatives.PlayerId()),
    }
end

---@return table
function LVToolsCoords.GetDashboardData()
    local live = LVToolsCoords.GetLiveData()
    local frameTime = GetFrameTime()
    live.fps = frameTime > 0 and math.floor(1.0 / frameTime) or 0
    -- GetPlayerPing is server-only; client cannot read its own ping.
    live.ping = 0
    live.resourceCount = GetNumResources()
    live.dimension = 0 -- routing bucket set server-side if needed

    return live
end

---@param format string
---@param opts table|nil
---@return string|nil
function LVToolsCoords.FormatCopy(format, opts)
    local ped = cachedNatives.PlayerPedId()
    local coords = cachedNatives.GetEntityCoords(ped)
    local heading = cachedNatives.GetEntityHeading(ped)
    local x, y, z = LVTools.Round(coords.x), LVTools.Round(coords.y), LVTools.Round(coords.z)
    local h = LVTools.Round(heading)

    if format == 'vector2' then
        return ('vector2(%.2f, %.2f)'):format(x, y)
    elseif format == 'vector3' then
        return LVTools.FormatVector3(coords)
    elseif format == 'vector4' then
        return LVTools.FormatVector4(coords, heading)
    elseif format == 'heading' then
        return LVTools.FormatHeading(heading)
    elseif format == 'json' then
        return json.encode({ x = x, y = y, z = z, heading = h })
    elseif format == 'lua' then
        return ('{ coords = %s, heading = %.2f }'):format(LVTools.FormatVector3(coords), h)
    elseif format == 'qb-target' then
        return ('{ coords = %s, radius = 1.5 }'):format(LVTools.FormatVector3(coords))
    elseif format == 'ox-target' then
        return ('{ coords = %s, size = vec3(1.5, 1.5, 1.5), rotation = %.2f }'):format(LVTools.FormatVector3(coords), h)
    elseif format == 'polyzone' then
        return ('vector2(%.2f, %.2f)'):format(x, y)
    elseif format == 'circlezone' then
        return ('{ center = %s, radius = 2.0 }'):format(LVTools.FormatVector3(coords))
    elseif format == 'boxzone' then
        return ('{ center = %s, length = 3.0, width = 3.0, heading = %.2f }'):format(LVTools.FormatVector3(coords), h)
    elseif format == 'combozone' then
        return '-- ComboZone requires multiple zones'
    elseif format == 'spawn' then
        return LVTools.FormatVector4(coords, heading)
    elseif format == 'teleport' then
        return ('/tp %.2f %.2f %.2f'):format(x, y, z)
    end

    return nil
end

---Push live coordinate updates to NUI when tab is active.
function LVToolsCoords.Tick()
    if not LVToolsState.IsModuleActive('coordinates') and not LVToolsState.IsModuleActive('dashboard') then
        return
    end

    local rate = LVToolsState.IsModuleActive('dashboard')
        and Config.UpdateRates.dashboard
        or Config.UpdateRates.coordinates

    if not LVTools.Throttle('coords_update', rate) then
        return
    end

    local action = LVToolsState.IsModuleActive('dashboard') and 'dashboardUpdate' or 'coordinatesUpdate'
    local data = LVToolsState.IsModuleActive('dashboard')
        and LVToolsCoords.GetDashboardData()
        or LVToolsCoords.GetLiveData()

    LVToolsNUI.Send(action, data)
end
