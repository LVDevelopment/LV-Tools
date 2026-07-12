LVToolsExports = {}

---Check if player has toolkit access.
---@param src number
---@return boolean
exports('HasAccess', function(src)
    return LVToolsPermissions.HasAccess(src)
end)

---Open toolkit UI for a player (server-triggered).
---@param src number
exports('OpenUI', function(src)
    if LVToolsPermissions.HasAccess(src) then
        TriggerClientEvent('lv-tools:client:openUI', src)
    end
end)

---Notify a player via toolkit toast.
---@param src number
---@param message string
---@param notifyType string|nil
exports('Notify', function(src, message, notifyType)
    TriggerClientEvent('lv-tools:client:notify', src, message, notifyType or 'info')
end)

RegisterNetEvent('lv-tools:server:utility', function(data)
    local src = source
    if not LVToolsPermissions.Validate(src) then return end

    local action = data and data.action
    if not action then return end

    -- Server-validated utility actions (no client trust)
    TriggerClientEvent('lv-tools:client:utility', src, action, data.payload or {})
end)

