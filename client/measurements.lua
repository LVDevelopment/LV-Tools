LVToolsMeasurements = {}

local points = {}

---Compute distance/height/slope/area metrics from the current points.
---@return table
local function Compute()
    local count = #points
    local result = {
        points = points,
        count = count,
        distance = 0,
        horizontal = 0,
        height = 0,
        slope = 0,
        area = 0,
    }

    if count < 2 then
        return result
    end

    local a = points[count - 1]
    local b = points[count]
    local dx, dy, dz = b.x - a.x, b.y - a.y, b.z - a.z

    result.distance = LVTools.Round(math.sqrt(dx * dx + dy * dy + dz * dz))
    result.horizontal = LVTools.Round(math.sqrt(dx * dx + dy * dy))
    result.height = LVTools.Round(math.abs(dz))
    if result.horizontal > 0 then
        result.slope = LVTools.Round(math.deg(math.atan(math.abs(dz) / result.horizontal)))
    end

    -- Total path length
    local total = 0
    for i = 2, count do
        local p1, p2 = points[i - 1], points[i]
        total = total + math.sqrt((p2.x - p1.x) ^ 2 + (p2.y - p1.y) ^ 2 + (p2.z - p1.z) ^ 2)
    end
    result.total = LVTools.Round(total)

    -- Polygon area (2D shoelace) when 3+ points
    if count >= 3 then
        local area = 0
        for i = 1, count do
            local p1 = points[i]
            local p2 = points[(i % count) + 1]
            area = area + (p1.x * p2.y - p2.x * p1.y)
        end
        result.area = LVTools.Round(math.abs(area) / 2)
    end

    return result
end

---@return table
function LVToolsMeasurements.GetData()
    return Compute()
end

---@param data table
---@return table
function LVToolsMeasurements.HandleAction(data)
    local action = data.action

    if action == 'addPoint' then
        local coords
        if data.placement == 'raycast' then
            local ray = LVToolsRaycast.CastNow()
            coords = ray.hit and ray.coords or nil
        end
        if not coords then
            coords = LVTools.Vec3ToTable(GetEntityCoords(PlayerPedId()))
        end
        points[#points + 1] = coords
        return { success = true, data = Compute() }

    elseif action == 'undo' then
        if #points > 0 then
            table.remove(points)
        end
        return { success = true, data = Compute() }

    elseif action == 'clear' then
        points = {}
        return { success = true, data = Compute() }
    end

    return { success = false, error = 'Unknown action' }
end

---Draw measurement points and connecting lines.
function LVToolsMeasurements.Tick()
    if not LVToolsState.IsModuleActive('measurements') then return end
    if #points == 0 then return end

    for i, p in ipairs(points) do
        DrawMarker(
            28, p.x, p.y, p.z,
            0, 0, 0, 0, 0, 0,
            0.15, 0.15, 0.15,
            59, 130, 246, 220,
            false, false, 2, false, nil, nil, false
        )
        if i > 1 then
            local prev = points[i - 1]
            DrawLine(prev.x, prev.y, prev.z, p.x, p.y, p.z, 59, 130, 246, 255)
        end
    end
end
