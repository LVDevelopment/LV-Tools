LVToolsRaycast = {}

local lastResult = {
    hit = false,
    entity = 0,
    coords = { x = 0, y = 0, z = 0 },
    normal = { x = 0, y = 0, z = 0 },
    distance = 0,
    entityType = 'none',
    model = 0,
    modelName = 'unknown',
    plate = nil,
    frozen = false,
    frozenData = nil,
    enabled = false,
}

local frozen = false
-- Global "raycast mode": when true the raycast draws lines/crosshair and pushes
-- live look-at data regardless of which tab is open (0.00ms when off).
local enabled = false

---@param distance number
---@return table
local function RaycastFromCamera(distance)
    local camCoord = GetGameplayCamCoord()
    local camRot = GetGameplayCamRot(2)
    local direction = LVTools.RotationToDirection(camRot)

    local dest = vector3(
        camCoord.x + direction.x * distance,
        camCoord.y + direction.y * distance,
        camCoord.z + direction.z * distance
    )

    local rayHandle = StartShapeTestRay(
        camCoord.x, camCoord.y, camCoord.z,
        dest.x, dest.y, dest.z,
        -1,
        PlayerPedId(),
        0
    )

    local _, hit, endCoords, surfaceNormal, entityHit = GetShapeTestResult(rayHandle)
    local playerCoords = GetEntityCoords(PlayerPedId())
    local hitCoords = endCoords or dest
    local dist = #(playerCoords - hitCoords)

    local entityType = 'none'
    local model = 0
    local modelName = 'unknown'
    local plate = nil

    if entityHit and entityHit ~= 0 and DoesEntityExist(entityHit) then
        -- Guard native calls: some world entities can throw inside GetEntityModel.
        pcall(function()
            local et = GetEntityType(entityHit)
            if et == 1 then entityType = 'ped'
            elseif et == 2 then entityType = 'vehicle'
            elseif et == 3 then entityType = 'object' end

            model = GetEntityModel(entityHit) or 0
            modelName = tostring(model)

            if entityType == 'vehicle' then
                plate = GetVehicleNumberPlateText(entityHit)
                if IsModelValid(model) then
                    local displayName = GetDisplayNameFromVehicleModel(model)
                    if displayName and displayName ~= '' and displayName ~= 'CARNOTFOUND' and displayName ~= 'NULL' then
                        modelName = displayName
                    end
                end
            end
        end)
    end

    return {
        hit = hit == 1,
        entity = entityHit or 0,
        coords = LVTools.Vec3ToTable(hitCoords),
        normal = LVTools.Vec3ToTable(surfaceNormal or vector3(0, 0, 0)),
        distance = LVTools.Round(dist),
        entityType = entityType,
        model = model,
        modelName = modelName,
        plate = plate,
        startCoords = LVTools.Vec3ToTable(camCoord),
        endCoords = LVTools.Vec3ToTable(dest),
        enabled = enabled,
    }
end

---Perform a fresh camera raycast on demand (used by prop/marker placement).
---@param distance number|nil
---@return table
function LVToolsRaycast.CastNow(distance)
    return RaycastFromCamera(distance or Config.Raycast.distance)
end

---@return table
function LVToolsRaycast.GetData()
    if frozen and lastResult.frozenData then
        return lastResult.frozenData
    end
    return lastResult
end

---@return boolean
function LVToolsRaycast.IsEnabled()
    return enabled
end

---Enable/disable global raycast mode.
---@param state boolean
function LVToolsRaycast.SetEnabled(state)
    enabled = state == true
    lastResult.enabled = enabled
    if enabled then
        -- Prime an immediate result so the UI/overlay populate instantly.
        lastResult = RaycastFromCamera(Config.Raycast.distance)
    end
    LVToolsNUI.Send('raycastUpdate', lastResult)
    LVToolsNUI.Notify(enabled and 'Raycast enabled — [E] copy Vector3, [Q] copy Vector4' or 'Raycast disabled',
        enabled and LVToolsNotifyType.SUCCESS or LVToolsNotifyType.INFO)
end

---@param state boolean
function LVToolsRaycast.Freeze(state)
    frozen = state
    if frozen then
        lastResult.frozenData = LVTools.DeepCopy(lastResult)
        lastResult.frozenData.frozen = true
    else
        lastResult.frozenData = nil
    end
end

---Copy the current hit position in the given format (E/Q keybinds + panel buttons).
---@param format string|nil 'vector3' | 'vector4'
---@return string|nil
function LVToolsRaycast.CopyHit(format)
    if not enabled then return nil end

    local d = LVToolsRaycast.GetData()
    if not d.hit then
        LVToolsNUI.Notify('Raycast: nothing in sight', LVToolsNotifyType.WARNING)
        return nil
    end

    local text
    if format == 'vector4' then
        local heading = GetEntityHeading(PlayerPedId())
        text = ('vector4(%.2f, %.2f, %.2f, %.2f)'):format(d.coords.x, d.coords.y, d.coords.z, heading)
    else
        text = ('vector3(%.2f, %.2f, %.2f)'):format(d.coords.x, d.coords.y, d.coords.z)
    end

    LVToolsNUI.CopyToClipboard(text)
    if LVToolsClipboard then LVToolsClipboard.Add(text, format or 'vector3') end
    LVToolsNUI.Notify('Copied ' .. text, LVToolsNotifyType.SUCCESS)
    return text
end

---@param format string|nil
---@return string|nil
function LVToolsRaycast.GetCopyText(format)
    local data = LVToolsRaycast.GetData()
    if format == 'coords' then
        return ('vector3(%.2f, %.2f, %.2f)'):format(data.coords.x, data.coords.y, data.coords.z)
    elseif format == 'normal' then
        return ('vector3(%.2f, %.2f, %.2f)'):format(data.normal.x, data.normal.y, data.normal.z)
    end
    return json.encode(data)
end

local function DrawTxt(text, x, y, scale, alpha)
    SetTextFont(4)
    SetTextScale(scale, scale)
    SetTextColour(235, 240, 250, alpha or 230)
    SetTextEntry('STRING')
    AddTextComponentString(text)
    DrawText(x, y)
end

---Draw a clean "what am I looking at" HUD when raycast mode is on.
local function DrawOverlay()
    local d = lastResult
    local left, pad = 0.018, 0.010
    local top = 0.24
    local lineH = 0.020

    -- Compact rows: title, coords/dist, target, hint
    local rows = {}
    rows[#rows + 1] = { text = 'RAYCAST', accent = true }
    if d.hit then
        rows[#rows + 1] = { text = ('%s  ·  %.1fm'):format(d.entityType, d.distance) }
        rows[#rows + 1] = { text = ('%.2f, %.2f, %.2f'):format(d.coords.x, d.coords.y, d.coords.z) }
        if d.entityType ~= 'none' and d.modelName ~= 'unknown' then
            rows[#rows + 1] = { text = d.modelName, dim = true }
        end
        if d.plate then rows[#rows + 1] = { text = 'plate ' .. d.plate, dim = true } end
    else
        rows[#rows + 1] = { text = 'nothing in sight', dim = true }
    end
    rows[#rows + 1] = { text = '[E] Vector3   [Q] Vector4', dim = true }

    -- Background panel
    local boxH = (#rows * lineH) + pad * 2
    local boxW = 0.185
    DrawRect(left + boxW / 2, top + boxH / 2 - lineH / 2, boxW, boxH, 12, 14, 20, 170)
    -- Accent bar
    DrawRect(left, top + boxH / 2 - lineH / 2, 0.0018, boxH, 59, 130, 246, 230)

    local y = top
    for _, row in ipairs(rows) do
        if row.accent then
            SetTextColour(90, 150, 255, 255)
            SetTextFont(4)
            SetTextScale(0.30, 0.30)
            SetTextEntry('STRING')
            AddTextComponentString(row.text)
            DrawText(left + pad, y)
        else
            DrawTxt(row.text, left + pad, y, row.dim and 0.28 or 0.31, row.dim and 150 or 235)
        end
        y = y + lineH
    end
end

---Draw raycast line, hit marker and crosshair.
local function DrawVisualization()
    local data = LVToolsRaycast.GetData()
    if not data.startCoords then return end

    if Config.Raycast.drawLine then
        DrawLine(
            data.startCoords.x, data.startCoords.y, data.startCoords.z,
            data.coords.x, data.coords.y, data.coords.z,
            59, 130, 246, 255
        )
    end

    if Config.Raycast.drawMarker and data.hit then
        DrawMarker(
            28, data.coords.x, data.coords.y, data.coords.z,
            0, 0, 0, 0, 0, 0,
            0.05, 0.05, 0.05,
            59, 130, 246, 200,
            false, false, 2, false, nil, nil, false
        )
    end

    if Config.Raycast.drawCrosshair then
        DrawRect(0.5, 0.5, 0.002, 0.02, 59, 130, 246, 200)
        DrawRect(0.5, 0.5, 0.02, 0.002, 59, 130, 246, 200)
    end
end

---Update raycast when the tab is active OR global raycast mode is enabled.
function LVToolsRaycast.Tick()
    if not (enabled or LVToolsState.IsModuleActive('raycast')) then
        return
    end

    if not frozen then
        if LVTools.Throttle('raycast_update', Config.UpdateRates.raycast) then
            lastResult = RaycastFromCamera(Config.Raycast.distance)
            LVToolsNUI.Send('raycastUpdate', lastResult)
        end
    end

    DrawVisualization()

    if enabled then
        DrawOverlay()
    end
end

-- E / Q keybinds copy the raycast hit position (only act while raycast mode is on).
RegisterCommand('lvtools_ray_copyv3', function()
    LVToolsRaycast.CopyHit('vector3')
end, false)
RegisterCommand('lvtools_ray_copyv4', function()
    LVToolsRaycast.CopyHit('vector4')
end, false)
RegisterKeyMapping('lvtools_ray_copyv3', 'LV-Tools: Copy raycast Vector3', 'keyboard', 'E')
RegisterKeyMapping('lvtools_ray_copyv4', 'LV-Tools: Copy raycast Vector4', 'keyboard', 'Q')
