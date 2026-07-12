LVToolsPermissions = {}

---@param src number
---@return string|nil
local function GetLicense(src)
    for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
        if identifier:sub(1, 8) == 'license:' then
            return identifier
        end
    end
    return nil
end

---@param src number
---@return boolean
function LVToolsPermissions.HasAccess(src)
    if src == 0 then return true end

    -- Ace admins always pass (portable across every framework).
    if IsPlayerAceAllowed(src, Config.AcePermission) then
        return true
    end

    local mode = Config.PermissionMode
    if mode == 'auto' then
        mode = LVToolsFramework.Detect() -- qbcore | qbox | esx | standalone
    end

    if mode == 'standalone' then
        return Config.StandaloneAllowAll
    elseif mode == 'ace' then
        return IsPlayerAceAllowed(src, Config.AcePermission)
    elseif mode == 'license' then
        local license = GetLicense(src)
        return license ~= nil and Config.Licenses[license] == true
    elseif mode == 'qbcore' then
        return LVToolsFramework.HasGroup(src, Config.QBCorePermission)
    elseif mode == 'qbox' then
        return LVToolsFramework.HasGroup(src, Config.QboxPermission)
    elseif mode == 'esx' then
        return LVToolsFramework.HasGroup(src, Config.ESXPermission)
    end

    return false
end

---@param src number
function LVToolsPermissions.Deny(src)
    TriggerClientEvent('lv-tools:client:notify', src, 'You do not have permission to use LV-Tools.', 'error')
end

---@param src number
---@return boolean
function LVToolsPermissions.Validate(src)
    if LVToolsPermissions.HasAccess(src) then
        return true
    end
    LVToolsPermissions.Deny(src)
    return false
end

RegisterNetEvent('lv-tools:server:requestPermission', function()
    local src = source
    TriggerClientEvent('lv-tools:client:permission', src, LVToolsPermissions.HasAccess(src))
end)
