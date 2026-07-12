LVToolsSave = {}

local dataCache = {}

---@param dataType string
---@return string
local function GetFilePath(dataType)
    local relative = Config.DataPaths[dataType]
    if not relative then return nil end
    return GetResourcePath(GetCurrentResourceName()) .. '/' .. relative
end

---@param dataType string
---@return table|nil
function LVToolsSave.Load(dataType)
    local path = GetFilePath(dataType)
    if not path then return nil end

    local file = io.open(path, 'r')
    if not file then return {} end

    local content = file:read('*a')
    file:close()

    if not content or content == '' then return {} end

    local ok, parsed = pcall(json.decode, content)
    if ok and type(parsed) == 'table' then
        dataCache[dataType] = parsed
        return parsed
    end

    return {}
end

---@param dataType string
---@param payload table
---@return boolean
function LVToolsSave.Save(dataType, payload)
    local path = GetFilePath(dataType)
    if not path then return false end

    dataCache[dataType] = payload
    local file = io.open(path, 'w')
    if not file then
        print('^1[LV-Tools] Failed to write: ' .. path .. '^0')
        return false
    end

    file:write(json.encode(payload, { indent = true }))
    file:close()
    return true
end

RegisterNetEvent('lv-tools:server:save', function(dataType, payload)
    local src = source
    if not LVToolsPermissions.Validate(src) then return end
    if type(dataType) ~= 'string' or type(payload) ~= 'table' then return end

    local ok = LVToolsSave.Save(dataType, payload)
    if ok then
        TriggerClientEvent('lv-tools:client:notify', src, ('Saved %s data.'):format(dataType), 'success')
    else
        TriggerClientEvent('lv-tools:client:notify', src, ('Failed to save %s.'):format(dataType), 'error')
    end
end)

RegisterNetEvent('lv-tools:server:load', function(dataType)
    local src = source
    if not LVToolsPermissions.Validate(src) then return end

    local data = LVToolsSave.Load(dataType) or {}

    if dataType == 'zones' then
        TriggerClientEvent('lv-tools:client:zonesLoaded', src, data)
    else
        TriggerClientEvent('lv-tools:client:dataLoaded', src, dataType, data)
    end
end)
