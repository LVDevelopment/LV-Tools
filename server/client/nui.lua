LVToolsNUI = {}

local isOpen = false

-- Controls to block while the menu is open so UI clicks don't fire weapons/melee.
local BLOCKED_CONTROLS = { 24, 25, 257, 263, 264, 140, 141, 142, 143 }

---Keep the player able to walk around while the cursor is up; swallow attack inputs.
local function StartInputGuard()
    CreateThread(function()
        while isOpen do
            for i = 1, #BLOCKED_CONTROLS do
                DisableControlAction(0, BLOCKED_CONTROLS[i], true)
            end
            Wait(0)
        end
    end)
end

---Send message to React UI.
---@param action string
---@param data table|nil
function LVToolsNUI.Send(action, data)
    SendNUIMessage({
        action = action,
        data = data or {},
    })
end

---Open the developer UI.
function LVToolsNUI.Open()
    if isOpen then return end
    if not LVToolsState.hasPermission then
        LVToolsNUI.Notify('You do not have permission to use LV-Tools.', LVToolsNotifyType.ERROR)
        return
    end

    isOpen = true
    LVToolsState.SetUIOpen(true)
    SetNuiFocus(true, true)
    -- Keep game input flowing so the player can still walk around with the menu open.
    SetNuiFocusKeepInput(true)
    StartInputGuard()
    LVToolsNUI.Send('open', {
        config = Config.UI,
        tabs = LVToolsTab,
    })
end

---Close the developer UI.
function LVToolsNUI.Close()
    if not isOpen then return end

    if LVToolsDoorlocks and LVToolsDoorlocks.IsAiming() then
        LVToolsDoorlocks.SetAim(false)
    end

    isOpen = false
    LVToolsState.SetUIOpen(false)
    SetNuiFocusKeepInput(false)
    SetNuiFocus(false, false)
    LVToolsNUI.Send('close', {})
end

---Toggle UI visibility.
function LVToolsNUI.Toggle()
    if isOpen then
        LVToolsNUI.Close()
    else
        LVToolsNUI.Open()
    end
end

---@return boolean
function LVToolsNUI.IsOpen()
    return isOpen
end

---Push toast notification to UI.
---@param message string
---@param notifyType string
function LVToolsNUI.Notify(message, notifyType)
    LVToolsNUI.Send('notify', {
        message = message,
        type = notifyType or LVToolsNotifyType.INFO,
    })
end

---Copy text via NUI clipboard bridge.
---@param text string
function LVToolsNUI.CopyToClipboard(text)
    LVToolsNUI.Send('copy', { text = text })
end

---Register NUI callback with error handling.
---@param name string
---@param handler fun(data: table, cb: fun(result: any))
function LVToolsNUI.RegisterCallback(name, handler)
    RegisterNUICallback(name, function(data, cb)
        local ok, result = pcall(handler, data or {}, cb)
        if not ok then
            print(('^1[LV-Tools] NUI callback error (%s): %s^0'):format(name, result))
            cb({ success = false, error = tostring(result) })
        end
    end)
end

---Initialize all NUI route handlers.
function LVToolsNUI.Init()
    LVToolsNUI.RegisterCallback('close', function(_, cb)
        LVToolsNUI.Close()
        cb({ success = true })
    end)

    LVToolsNUI.RegisterCallback('setActiveTab', function(data, cb)
        if data.tab then
            LVToolsState.SetActiveTab(data.tab)
        end
        cb({ success = true, tab = LVToolsState.activeTab })
    end)

    -- The UI toggles this while a text field is focused so typing doesn't leak
    -- into the game (movement stays available otherwise).
    LVToolsNUI.RegisterCallback('setKeepInput', function(data, cb)
        if isOpen and not (LVToolsDoorlocks and LVToolsDoorlocks.IsAiming()) then
            SetNuiFocusKeepInput(data.keep == true)
        end
        cb({ success = true })
    end)

    LVToolsNUI.RegisterCallback('getDashboard', function(_, cb)
        cb({ success = true, data = LVToolsCoords.GetDashboardData() })
    end)

    LVToolsNUI.RegisterCallback('getCoordinates', function(_, cb)
        cb({ success = true, data = LVToolsCoords.GetLiveData() })
    end)

    LVToolsNUI.RegisterCallback('copyFormat', function(data, cb)
        local format = data.format
        local text = LVToolsCoords.FormatCopy(format, data)
        if text then
            LVToolsNUI.CopyToClipboard(text)
            LVToolsClipboard.Add(text, format)
            cb({ success = true, text = text })
        else
            cb({ success = false, error = 'Unknown format' })
        end
    end)

    LVToolsNUI.RegisterCallback('getRaycast', function(_, cb)
        cb({ success = true, data = LVToolsRaycast.GetData() })
    end)

    LVToolsNUI.RegisterCallback('raycastAction', function(data, cb)
        local action = data.action

        if action == 'freeze' then
            LVToolsRaycast.Freeze(data.frozen == true)
        elseif action == 'enable' then
            LVToolsRaycast.SetEnabled(data.enabled == true)
        elseif action == 'spawnMarker' then
            LVToolsMarkers.SpawnAtRaycast()
        elseif action == 'copyHit' then
            local text = LVToolsRaycast.CopyHit(data.format)
            cb({ success = text ~= nil, text = text })
            return
        elseif action == 'copy' then
            local text = LVToolsRaycast.GetCopyText(data.format)
            if text then
                LVToolsNUI.CopyToClipboard(text)
                LVToolsClipboard.Add(text, 'raycast')
            end
        end

        cb({ success = true })
    end)

    LVToolsNUI.RegisterCallback('getZones', function(_, cb)
        cb({ success = true, data = LVToolsPolyzones.GetAll() })
    end)

    LVToolsNUI.RegisterCallback('zoneAction', function(data, cb)
        local result = LVToolsPolyzones.HandleAction(data)
        cb(result or { success = false })
    end)

    LVToolsNUI.RegisterCallback('getClipboard', function(_, cb)
        cb({ success = true, data = LVToolsClipboard.GetAll() })
    end)

    LVToolsNUI.RegisterCallback('clipboardAction', function(data, cb)
        cb(LVToolsClipboard.HandleAction(data))
    end)

    LVToolsNUI.RegisterCallback('debugAction', function(data, cb)
        cb(LVToolsDebug.HandleAction(data))
    end)

    LVToolsNUI.RegisterCallback('getProps', function(_, cb)
        cb({ success = true, data = LVToolsProps.GetAll() })
    end)

    LVToolsNUI.RegisterCallback('propAction', function(data, cb)
        local result = LVToolsProps.HandleAction(data)
        cb({
            success = result.success == true,
            error = result.error,
            text = result.text,
            data = { props = result.props },
        })
    end)

    LVToolsNUI.RegisterCallback('getMarkers', function(_, cb)
        cb({ success = true, data = LVToolsMarkers.GetAll() })
    end)

    LVToolsNUI.RegisterCallback('markerAction', function(data, cb)
        local result = LVToolsMarkers.HandleAction(data)
        cb({
            success = result.success == true,
            error = result.error,
            data = { markers = result.markers },
        })
    end)

    LVToolsNUI.RegisterCallback('getMeasurements', function(_, cb)
        cb({ success = true, data = LVToolsMeasurements.GetData() })
    end)

    LVToolsNUI.RegisterCallback('measurementAction', function(data, cb)
        local result = LVToolsMeasurements.HandleAction(data)
        cb({ success = result.success == true, error = result.error, data = result.data })
    end)

    LVToolsNUI.RegisterCallback('getDoorlocks', function(_, cb)
        TriggerServerEvent('lv-tools:server:getJobs')
        cb({ success = true, data = LVToolsDoorlocks.GetAll() })
    end)

    LVToolsNUI.RegisterCallback('doorlockAction', function(data, cb)
        local result = LVToolsDoorlocks.HandleAction(data)
        cb({
            success = result.success == true,
            error = result.error,
            text = result.text,
            data = { doors = result.doors },
        })
    end)

    LVToolsNUI.RegisterCallback('getPerformance', function(_, cb)
        local frameTime = GetFrameTime()
        if frameTime <= 0 then frameTime = 1 / 60 end
        cb({
            success = true,
            data = {
                fps = math.floor(1.0 / frameTime),
                frameTimeMs = LVTools.Round(frameTime * 1000),
                ping = 0, -- GetPlayerPing is server-only
                resourceCount = GetNumResources(),
                memoryMb = LVTools.Round(collectgarbage('count') / 1024),
            },
        })
    end)

    LVToolsNUI.RegisterCallback('utilityAction', function(data, cb)
        TriggerEvent('lv-tools:client:utility', data.action, data.payload)
        cb({ success = true })
    end)

    LVToolsNUI.RegisterCallback('saveData', function(data, cb)
        TriggerServerEvent('lv-tools:server:save', data.type, data.payload)
        cb({ success = true })
    end)

    LVToolsNUI.RegisterCallback('loadData', function(data, cb)
        TriggerServerEvent('lv-tools:server:load', data.type)
        cb({ success = true })
    end)

    LVToolsNUI.RegisterCallback('getSettings', function(_, cb)
        cb({ success = true, data = Config.UI })
    end)

    LVToolsNUI.RegisterCallback('updateSettings', function(data, cb)
        for k, v in pairs(data) do
            if Config.UI[k] ~= nil then
                Config.UI[k] = v
            end
        end
        cb({ success = true, data = Config.UI })
    end)

    RegisterNUICallback('copied', function(_, cb)
        cb('ok')
    end)
end

RegisterNetEvent('lv-tools:client:notify', function(message, notifyType)
    LVToolsNUI.Notify(message, notifyType)
end)

RegisterNetEvent('lv-tools:client:permission', function(hasAccess)
    LVToolsState.hasPermission = hasAccess
    if not hasAccess and LVToolsNUI.IsOpen() then
        LVToolsNUI.Close()
    end
end)

RegisterNetEvent('lv-tools:client:dataLoaded', function(dataType, payload)
    LVToolsNUI.Send('dataLoaded', { type = dataType, payload = payload })
end)

RegisterNetEvent('lv-tools:client:openUI', function()
    LVToolsNUI.Open()
end)

RegisterNetEvent('lv-tools:client:utility', function(action, payload)
    if action == 'noclip' then
        LVToolsNUI.Notify('Noclip: Phase 2 implementation', LVToolsNotifyType.INFO)
    elseif action == 'revive' then
        local ped = PlayerPedId()
        NetworkResurrectLocalPlayer(GetEntityCoords(ped), GetEntityHeading(ped), true, false)
        SetEntityHealth(ped, 200)
        LVToolsNUI.Notify('Revived', LVToolsNotifyType.SUCCESS)
    elseif action == 'heal' then
        SetEntityHealth(PlayerPedId(), 200)
        LVToolsNUI.Notify('Healed', LVToolsNotifyType.SUCCESS)
    elseif action == 'armor' then
        SetPedArmour(PlayerPedId(), 100)
        LVToolsNUI.Notify('Armor set', LVToolsNotifyType.SUCCESS)
    else
        LVToolsNUI.Notify(('Utility "%s" — Phase 2'):format(action), LVToolsNotifyType.INFO)
    end
end)
