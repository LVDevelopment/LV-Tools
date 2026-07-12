---Central state machine — only active modules run expensive loops.
LVToolsState = {
    uiOpen = false,
    activeTab = LVToolsTab.DASHBOARD,
    hasPermission = false,
    modules = {},
}

---@param tab string
function LVToolsState.SetActiveTab(tab)
    LVToolsState.activeTab = tab
    LVToolsState.SyncModules()
end

---@param open boolean
function LVToolsState.SetUIOpen(open)
    LVToolsState.uiOpen = open
    LVToolsState.SyncModules()
end

---@param moduleName string
---@param enabled boolean
function LVToolsState.SetModule(moduleName, enabled)
    LVToolsState.modules[moduleName] = enabled
end

---@param moduleName string
---@return boolean
function LVToolsState.IsModuleActive(moduleName)
    if not LVToolsState.hasPermission then
        return false
    end

    if LVToolsState.modules[moduleName] then
        return true
    end

    return false
end

---Sync module activation based on UI state and active tab.
function LVToolsState.SyncModules()
    local tab = LVToolsState.activeTab
    local open = LVToolsState.uiOpen

    LVToolsState.modules = {
        dashboard = open and tab == LVToolsTab.DASHBOARD,
        coordinates = open and tab == LVToolsTab.COORDINATES,
        raycast = open and tab == LVToolsTab.RAYCAST,
        polyzones = open and tab == LVToolsTab.POLYZONES,
        doorlocks = open and tab == LVToolsTab.DOORLOCKS,
        props = open and tab == LVToolsTab.PROPS,
        markers = open and tab == LVToolsTab.MARKERS,
        measurements = open and tab == LVToolsTab.MEASUREMENTS,
        debug = open and tab == LVToolsTab.DEBUG,
        devcam = false,
    }

    -- Debug overlays can stay active when debug tab is open
    if open and tab == LVToolsTab.DEBUG then
        LVToolsState.modules.debug = true
    end
end

---@return boolean
function LVToolsState.NeedsFrameTick()
    if not LVToolsState.hasPermission then
        return false
    end

    for _, active in pairs(LVToolsState.modules) do
        if active then
            return true
        end
    end

    -- Global raycast mode keeps the frame tick alive even off the raycast tab.
    if LVToolsRaycast and LVToolsRaycast.IsEnabled() then
        return true
    end

    -- Door creator aim mode keeps the frame tick alive.
    if LVToolsDoorlocks and LVToolsDoorlocks.IsAiming() then
        return true
    end

    if LVToolsPolyzones and LVToolsPolyzones.IsEditing() then
        return true
    end

    if LVToolsDebug and LVToolsDebug.HasActiveOverlays() then
        return true
    end

    return false
end
