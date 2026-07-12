LVToolsMarkers = {}

local markers = {}
local nextId = 1

local MARKER_COLOR = { r = 59, g = 130, b = 246, a = 200 }

---@param entry table
---@return table
local function Serialize(entry)
    return {
        id = entry.id,
        coords = entry.coords,
        type = entry.type,
    }
end

---@return table
function LVToolsMarkers.GetAll()
    local list = {}
    for _, entry in pairs(markers) do
        list[#list + 1] = Serialize(entry)
    end
    return { markers = list }
end

---Resolve placement: raycast hit or in front of the player.
---@param mode string|nil
---@return table
local function GetPlacement(mode)
    if mode == 'raycast' then
        local ray = LVToolsRaycast.CastNow()
        if ray.hit then return ray.coords end
    end
    local coords = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0.0, 2.0, 0.0)
    return LVTools.Vec3ToTable(coords)
end

---@param coords table
---@param markerType number|nil
---@return number
function LVToolsMarkers.AddMarker(coords, markerType)
    local id = nextId
    nextId = nextId + 1
    markers[id] = {
        id = id,
        coords = coords,
        type = markerType or 1,
        color = MARKER_COLOR,
    }
    return id
end

---Place a marker at the current raycast hit (used by the Raycast panel).
function LVToolsMarkers.SpawnAtRaycast()
    local ray = LVToolsRaycast.GetData()
    if not ray.hit then
        LVToolsNUI.Notify('No raycast hit to place marker.', LVToolsNotifyType.WARNING)
        return
    end
    LVToolsMarkers.AddMarker(ray.coords, 1)
    LVToolsNUI.Notify('Marker placed.', LVToolsNotifyType.SUCCESS)
    if LVToolsNUI.IsOpen() then
        LVToolsNUI.Send('markersUpdate', LVToolsMarkers.GetAll())
    end
end

---@param data table
---@return table
function LVToolsMarkers.HandleAction(data)
    local action = data.action

    if action == 'add' then
        local coords = GetPlacement(data.placement)
        LVToolsMarkers.AddMarker(coords, data.type or 1)
        LVToolsNUI.Notify('Marker placed.', LVToolsNotifyType.SUCCESS)
        return { success = true, markers = LVToolsMarkers.GetAll().markers }

    elseif action == 'delete' then
        if markers[data.id] then
            markers[data.id] = nil
            return { success = true, markers = LVToolsMarkers.GetAll().markers }
        end
        return { success = false, error = 'Marker not found' }

    elseif action == 'clear' then
        markers = {}
        LVToolsNUI.Notify('Cleared all markers', LVToolsNotifyType.INFO)
        return { success = true, markers = {} }

    elseif action == 'copy' then
        local entry = markers[data.id]
        if entry then
            local text = ('vector3(%.2f, %.2f, %.2f)'):format(entry.coords.x, entry.coords.y, entry.coords.z)
            LVToolsNUI.CopyToClipboard(text)
            LVToolsClipboard.Add(text, 'marker')
            return { success = true, text = text }
        end
        return { success = false, error = 'Marker not found' }
    end

    return { success = false, error = 'Unknown action' }
end

---Draw active markers when the tab is open.
function LVToolsMarkers.Tick()
    if not LVToolsState.IsModuleActive('markers') then return end

    for _, marker in pairs(markers) do
        local c = marker.coords
        DrawMarker(
            marker.type or 1, c.x, c.y, c.z,
            0, 0, 0, 0, 0, 0,
            0.5, 0.5, 0.5,
            marker.color.r, marker.color.g, marker.color.b, marker.color.a,
            false, false, 2, false, nil, nil, false
        )
    end
end
