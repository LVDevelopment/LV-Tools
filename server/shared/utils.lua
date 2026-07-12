LVTools = LVTools or {}

---Round number to configured decimal places.
---@param value number
---@return number
function LVTools.Round(value)
    local decimals = Config.Decimals or 2
    return tonumber(string.format('%.' .. decimals .. 'f', value))
end

---Serialize vector3 for JSON/NUI transport.
---@param coords vector3
---@return table
function LVTools.Vec3ToTable(coords)
    return {
        x = LVTools.Round(coords.x),
        y = LVTools.Round(coords.y),
        z = LVTools.Round(coords.z),
    }
end

---Serialize vector2 for JSON/NUI transport.
---@param coords vector2
---@return table
function LVTools.Vec2ToTable(coords)
    return {
        x = LVTools.Round(coords.x),
        y = LVTools.Round(coords.y),
    }
end

---Format vector3 as Lua string.
---@param coords vector3
---@return string
function LVTools.FormatVector3(coords)
    return ('vector3(%.2f, %.2f, %.2f)'):format(
        LVTools.Round(coords.x),
        LVTools.Round(coords.y),
        LVTools.Round(coords.z)
    )
end

---Format vector4 as Lua string.
---@param coords vector3
---@param heading number
---@return string
function LVTools.FormatVector4(coords, heading)
    return ('vector4(%.2f, %.2f, %.2f, %.2f)'):format(
        LVTools.Round(coords.x),
        LVTools.Round(coords.y),
        LVTools.Round(coords.z),
        LVTools.Round(heading)
    )
end

---Format heading.
---@param heading number
---@return string
function LVTools.FormatHeading(heading)
    return ('%.2f'):format(LVTools.Round(heading))
end

---Convert camera rotation to direction vector.
---@param rotation vector3
---@return vector3
function LVTools.RotationToDirection(rotation)
    local rotX = math.rad(rotation.x)
    local rotZ = math.rad(rotation.z)

    return vector3(
        -math.sin(rotZ) * math.abs(math.cos(rotX)),
        math.cos(rotZ) * math.abs(math.cos(rotX)),
        math.sin(rotX)
    )
end

---Deep copy a plain table (no metatables).
---@param tbl table
---@return table
function LVTools.DeepCopy(tbl)
    if type(tbl) ~= 'table' then
        return tbl
    end

    local copy = {}
    for k, v in pairs(tbl) do
        copy[k] = LVTools.DeepCopy(v)
    end
    return copy
end

---Throttle helper using GetGameTimer.
---@param key string
---@param intervalMs number
---@return boolean
function LVTools.Throttle(key, intervalMs)
    LVTools._throttle = LVTools._throttle or {}
    local now = GetGameTimer()
    local last = LVTools._throttle[key] or 0

    if now - last >= intervalMs then
        LVTools._throttle[key] = now
        return true
    end

    return false
end
