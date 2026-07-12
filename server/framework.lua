---Universal framework bridge (qb-core / qbox / esx / standalone).
LVToolsFramework = {}

local detected
local core

---@param name string
---@return boolean
local function IsStarted(name)
    return name ~= nil and name ~= '' and GetResourceState(name) == 'started'
end

---Detect (or force via Config.Framework) the active framework.
---@return string 'qbcore' | 'qbox' | 'esx' | 'standalone'
function LVToolsFramework.Detect()
    if detected then return detected end

    local fw = Config.Framework
    local names = Config.Frameworks

    if fw == 'standalone' then
        detected = 'standalone'
        return detected
    end

    -- Forced framework
    if fw == 'qbcore' and IsStarted(names.qbcore.resource) then
        detected, core = 'qbcore', exports[names.qbcore.resource]:GetCoreObject()
        return detected
    elseif fw == 'esx' and IsStarted(names.esx.resource) then
        detected, core = 'esx', exports[names.esx.resource]:getSharedObject()
        return detected
    elseif fw == 'qbox' and IsStarted(names.qbox.resource) then
        detected = 'qbox'
        return detected
    end

    -- Auto detection
    if IsStarted(names.qbox.resource) then
        detected = 'qbox'
    elseif IsStarted(names.qbcore.resource) then
        detected = 'qbcore'
        local ok, obj = pcall(function() return exports[names.qbcore.resource]:GetCoreObject() end)
        if ok then core = obj end
    elseif IsStarted(names.esx.resource) then
        detected = 'esx'
        local ok, obj = pcall(function() return exports[names.esx.resource]:getSharedObject() end)
        if ok then core = obj end
    else
        detected = 'standalone'
    end

    return detected
end

---@return table|nil
function LVToolsFramework.GetCore()
    LVToolsFramework.Detect()
    return core
end

---Check whether a player belongs to an admin group/permission for the framework.
---@param src number
---@param group string
---@return boolean
function LVToolsFramework.HasGroup(src, group)
    local fw = LVToolsFramework.Detect()

    if fw == 'qbcore' and core then
        local ok, result = pcall(function()
            return core.Functions.HasPermission(src, group)
        end)
        if ok and result then return true end
        return IsPlayerAceAllowed(src, 'group.' .. group)
    elseif fw == 'qbox' then
        return IsPlayerAceAllowed(src, 'group.' .. group)
    elseif fw == 'esx' and core then
        local player = core.GetPlayerFromId and core.GetPlayerFromId(src)
        if player and player.getGroup then
            return player.getGroup() == group
        end
    end

    return IsPlayerAceAllowed(src, 'group.' .. group)
end

---Return a normalized job list: { { name, label }, ... }
---@return table
function LVToolsFramework.GetJobs()
    local list = {}

    local function push(name, label)
        list[#list + 1] = { name = name, label = label or name }
    end

    if Config.Jobs.source ~= 'manual' then
        local fw = LVToolsFramework.Detect()

        if fw == 'qbcore' and core and core.Shared and core.Shared.Jobs then
            for name, data in pairs(core.Shared.Jobs) do
                push(name, data and data.label)
            end
        elseif fw == 'qbox' then
            local ok, jobs = pcall(function()
                return exports[Config.Frameworks.qbox.resource]:GetJobs()
            end)
            if ok and type(jobs) == 'table' then
                for name, data in pairs(jobs) do
                    push(name, data and data.label)
                end
            end
        elseif fw == 'esx' and core and core.GetJobs then
            local ok, jobs = pcall(core.GetJobs)
            if ok and type(jobs) == 'table' then
                for name, data in pairs(jobs) do
                    push(name, (data and (data.label or data.name)) or name)
                end
            end
        end
    end

    -- Manual list / fallback
    if #list == 0 then
        for _, job in ipairs(Config.Jobs.list or {}) do
            push(job.name, job.label)
        end
    end

    table.sort(list, function(a, b) return a.label < b.label end)
    return list
end
