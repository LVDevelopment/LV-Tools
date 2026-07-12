LVToolsDebug = {}

local overlays = {
    entityIds = false,
    vehicleIds = false,
    zoneNames = false,
    heading = false,
    collision = false,
    boundingBoxes = false,
}

---@return boolean
function LVToolsDebug.HasActiveOverlays()
    for _, active in pairs(overlays) do
        if active then return true end
    end
    return false
end

---@param data table
---@return table
function LVToolsDebug.HandleAction(data)
    local key = data.overlay
    if key and overlays[key] ~= nil then
        overlays[key] = data.enabled == true
        Config.Debug[key] = overlays[key]
        return { success = true, overlays = overlays }
    end
    return { success = false }
end

local function DrawEntityOverlays()
    local playerCoords = GetEntityCoords(PlayerPedId())

    if overlays.entityIds or overlays.boundingBoxes then
        local entities = GetGamePool('CPed')
        for _, entity in ipairs(entities) do
            if entity ~= PlayerPedId() then
                local coords = GetEntityCoords(entity)
                if #(playerCoords - coords) < 50.0 then
                    if overlays.entityIds then
                        local onScreen, sx, sy = World3dToScreen2d(coords.x, coords.y, coords.z + 1.0)
                        if onScreen then
                            SetTextScale(0.3, 0.3)
                            SetTextFont(4)
                            SetTextColour(59, 130, 246, 255)
                            SetTextEntry('STRING')
                            AddTextComponentString(('ID: %d'):format(entity))
                            DrawText(sx, sy)
                        end
                    end
                end
            end
        end
    end

    if overlays.vehicleIds then
        local vehicles = GetGamePool('CVehicle')
        for _, vehicle in ipairs(vehicles) do
            local coords = GetEntityCoords(vehicle)
            if #(playerCoords - coords) < 80.0 then
                local onScreen, sx, sy = World3dToScreen2d(coords.x, coords.y, coords.z + 1.2)
                if onScreen then
                    SetTextScale(0.3, 0.3)
                    SetTextFont(4)
                    SetTextColour(59, 130, 246, 255)
                    SetTextEntry('STRING')
                    AddTextComponentString(('V: %d | %s'):format(vehicle, GetVehicleNumberPlateText(vehicle)))
                    DrawText(sx, sy)
                end
            end
        end
    end
end

function LVToolsDebug.Tick()
    if not LVToolsDebug.HasActiveOverlays() then return end
    DrawEntityOverlays()
end

-- Initialize from config
for k, v in pairs(Config.Debug) do
    if overlays[k] ~= nil then
        overlays[k] = v
    end
end
