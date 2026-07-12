LVToolsDoorlocks = {}

local doors = {}
local jobs = {}
local nextId = 1
local aiming = false

local CAPTURE_CONTROL = 38   -- E
local EXIT_CONTROL = 177     -- Backspace / cancel

---@return boolean
function LVToolsDoorlocks.IsAiming()
    return aiming
end

---@param list table
function LVToolsDoorlocks.SetJobs(list)
    jobs = list or {}
    if LVToolsNUI.IsOpen() then
        LVToolsNUI.Send('doorlocksUpdate', LVToolsDoorlocks.GetAll())
    end
end

local function Serialize(d)
    return {
        id = d.id,
        objName = d.objName,
        objHash = d.objHash,
        objYaw = d.objYaw,
        objCoords = d.objCoords,
        textCoords = d.textCoords,
        authorizedJobs = d.authorizedJobs,
        locked = d.locked,
        pickable = d.pickable,
        distance = d.distance,
    }
end

---@return table
function LVToolsDoorlocks.GetAll()
    local list = {}
    for _, d in ipairs(doors) do
        list[#list + 1] = Serialize(d)
    end
    return { doors = list, jobs = jobs }
end

---@param id number
---@return table|nil
local function FindDoor(id)
    for _, d in ipairs(doors) do
        if d.id == id then return d end
    end
    return nil
end

---Capture the door currently under the crosshair.
local function CaptureFromRay()
    local ray = LVToolsRaycast.CastNow(20.0)
    if not ray.hit then
        LVToolsNUI.Notify('No door in sight', LVToolsNotifyType.WARNING)
        return
    end

    local entity = ray.entity
    local coords, yaw, hash
    if entity and entity ~= 0 and DoesEntityExist(entity) then
        coords = GetEntityCoords(entity)
        yaw = GetEntityHeading(entity)
        hash = GetEntityModel(entity)
    else
        coords = vector3(ray.coords.x, ray.coords.y, ray.coords.z)
        yaw = GetEntityHeading(PlayerPedId())
        hash = 0
    end

    local id = nextId
    nextId = nextId + 1
    doors[#doors + 1] = {
        id = id,
        objName = Config.DoorNames[hash] or '',
        objHash = hash,
        objYaw = LVTools.Round(yaw),
        objCoords = LVTools.Vec3ToTable(coords),
        textCoords = LVTools.Vec3ToTable(coords),
        authorizedJobs = {},
        locked = Config.Doorlock.defaultLocked,
        pickable = Config.Doorlock.defaultPickable,
        distance = Config.Doorlock.defaultDistance,
    }

    LVToolsNUI.Notify(('Captured door #%d (%s)'):format(id, Config.DoorNames[hash] or ('hash ' .. hash)), LVToolsNotifyType.SUCCESS)
    LVToolsNUI.Send('doorlocksUpdate', LVToolsDoorlocks.GetAll())
end

---Toggle aim mode (releases the cursor so the player can look around).
---@param state boolean
function LVToolsDoorlocks.SetAim(state)
    aiming = state == true
    if aiming then
        SetNuiFocus(false, false)
        LVToolsNUI.Notify('Aim mode: look at a door, [E] capture, [Backspace] exit', LVToolsNotifyType.INFO)
    else
        if LVToolsNUI.IsOpen() then
            SetNuiFocus(true, true)
            SetNuiFocusKeepInput(true)
        end
    end
    LVToolsNUI.Send('doorlocksAim', { aiming = aiming })
end

---Build authorizedJobs array string: { 'police', 'ambulance' }
---@param d table
---@return string
local function JobsArray(d)
    local parts = {}
    for _, j in ipairs(d.authorizedJobs or {}) do
        parts[#parts + 1] = ("'%s'"):format(j)
    end
    return '{ ' .. table.concat(parts, ', ') .. ' }'
end

---Build ox_doorlock groups map string: { police = 0, ambulance = 0 }
---@param d table
---@return string
local function GroupsMap(d)
    local parts = {}
    for _, j in ipairs(d.authorizedJobs or {}) do
        parts[#parts + 1] = ("%s = 0"):format(j)
    end
    return '{ ' .. table.concat(parts, ', ') .. ' }'
end

---qb-doorlocks entry (vec3, pickable, authorizedJobs array).
local function BuildQb(d)
    local nameLine = (d.objName and d.objName ~= '')
        and ("\t\tobjName = '%s',"):format(d.objName)
        or ("\t\tobjHash = %s,"):format(d.objHash or 0)
    return table.concat({
        '\t{',
        nameLine,
        ("\t\tobjYaw = %.1f,"):format(d.objYaw),
        ("\t\tobjCoords  = vec3(%.2f, %.2f, %.2f),"):format(d.objCoords.x, d.objCoords.y, d.objCoords.z),
        ("\t\ttextCoords = vec3(%.2f, %.2f, %.2f),"):format(d.textCoords.x, d.textCoords.y, d.textCoords.z),
        ("\t\tauthorizedJobs = %s,"):format(JobsArray(d)),
        ("\t\tlocked = %s,"):format(tostring(d.locked)),
        ("\t\tpickable = %s,"):format(tostring(d.pickable)),
        ("\t\tdistance = %.1f,"):format(d.distance),
        '\t},',
    }, '\n')
end

---esx_doorlock entry (vector3, no pickable, authorizedJobs array).
local function BuildEsx(d)
    local nameLine = (d.objName and d.objName ~= '')
        and ("\t\tobjName = '%s',"):format(d.objName)
        or ("\t\tobjHash = %s,"):format(d.objHash or 0)
    return table.concat({
        '\t{',
        nameLine,
        ("\t\tobjYaw = %.1f,"):format(d.objYaw),
        ("\t\tobjCoords  = vector3(%.2f, %.2f, %.2f),"):format(d.objCoords.x, d.objCoords.y, d.objCoords.z),
        ("\t\ttextCoords = vector3(%.2f, %.2f, %.2f),"):format(d.textCoords.x, d.textCoords.y, d.textCoords.z),
        ("\t\tauthorizedJobs = %s,"):format(JobsArray(d)),
        ("\t\tlocked = %s,"):format(tostring(d.locked)),
        ("\t\tdistance = %.1f,"):format(d.distance),
        '\t},',
    }, '\n')
end

---ox_doorlock entry (used by Qbox): model/coords/state/maxDistance/groups.
local function BuildOx(d)
    local name = (d.objName and d.objName ~= '') and d.objName or ('door_' .. tostring(d.id or 0))
    local model = (d.objName and d.objName ~= '')
        and ("`%s`"):format(d.objName)
        or tostring(d.objHash or 0)
    return table.concat({
        '\t{',
        ("\t\tname = '%s',"):format(name),
        ("\t\tcoords = vec3(%.2f, %.2f, %.2f),"):format(d.objCoords.x, d.objCoords.y, d.objCoords.z),
        ("\t\tmodel = %s,"):format(model),
        ("\t\theading = %.1f,"):format(d.objYaw),
        ("\t\tstate = %d,"):format(d.locked and 1 or 0),
        ("\t\tmaxDistance = %.1f,"):format(d.distance),
        ("\t\tgroups = %s,"):format(GroupsMap(d)),
        ("\t\tlockpick = %s,"):format(tostring(d.pickable)),
        '\t},',
    }, '\n')
end

---@param d table door entry
---@param format string|nil 'qb' | 'esx' | 'qbox'
---@return string
local function BuildEntry(d, format)
    if format == 'esx' then
        return BuildEsx(d)
    elseif format == 'qbox' or format == 'ox' then
        return BuildOx(d)
    end
    return BuildQb(d)
end

---@param data table
---@return table
function LVToolsDoorlocks.HandleAction(data)
    local action = data.action

    if action == 'aim' then
        LVToolsDoorlocks.SetAim(data.enabled == true)
        return { success = true }

    elseif action == 'capture' then
        CaptureFromRay()
        return { success = true, doors = LVToolsDoorlocks.GetAll().doors }

    elseif action == 'update' then
        local d = FindDoor(data.id)
        if not d then return { success = false, error = 'Door not found' } end
        local p = data.patch or {}
        if p.objName ~= nil then d.objName = p.objName end
        if p.objYaw ~= nil then d.objYaw = tonumber(p.objYaw) or d.objYaw end
        if p.distance ~= nil then d.distance = tonumber(p.distance) or d.distance end
        if p.locked ~= nil then d.locked = p.locked == true end
        if p.pickable ~= nil then d.pickable = p.pickable == true end
        if p.authorizedJobs ~= nil then d.authorizedJobs = p.authorizedJobs end
        return { success = true, doors = LVToolsDoorlocks.GetAll().doors }

    elseif action == 'textHere' then
        local d = FindDoor(data.id)
        if not d then return { success = false, error = 'Door not found' } end
        d.textCoords = LVTools.Vec3ToTable(GetEntityCoords(PlayerPedId()))
        LVToolsNUI.Notify('Text position set to your location', LVToolsNotifyType.SUCCESS)
        return { success = true, doors = LVToolsDoorlocks.GetAll().doors }

    elseif action == 'delete' then
        for i, d in ipairs(doors) do
            if d.id == data.id then
                table.remove(doors, i)
                break
            end
        end
        return { success = true, doors = LVToolsDoorlocks.GetAll().doors }

    elseif action == 'clear' then
        doors = {}
        LVToolsNUI.Notify('Cleared captured doors', LVToolsNotifyType.INFO)
        return { success = true, doors = {} }

    elseif action == 'copy' then
        local d = FindDoor(data.id)
        if not d then return { success = false, error = 'Door not found' } end
        local text = BuildEntry(d, data.format)
        LVToolsNUI.CopyToClipboard(text)
        LVToolsClipboard.Add(text, 'doorlock')
        return { success = true, text = text }

    elseif action == 'exportAll' then
        local parts = {}
        for _, d in ipairs(doors) do
            parts[#parts + 1] = BuildEntry(d, data.format)
        end
        local text = table.concat(parts, '\n')
        LVToolsNUI.CopyToClipboard(text)
        LVToolsClipboard.Add(text, 'doorlock')
        return { success = true, text = text }

    elseif action == 'refreshJobs' then
        TriggerServerEvent('lv-tools:server:getJobs')
        return { success = true }
    end

    return { success = false, error = 'Unknown action' }
end

local function DrawText3D(coords, text)
    local onScreen, sx, sy = World3dToScreen2d(coords.x, coords.y, coords.z)
    if not onScreen then return end
    SetTextScale(0.32, 0.32)
    SetTextFont(4)
    SetTextColour(235, 240, 250, 220)
    SetTextEntry('STRING')
    SetTextCentre(true)
    AddTextComponentString(text)
    DrawText(sx, sy)
end

local function DrawHud(ray)
    -- Crosshair
    DrawRect(0.5, 0.5, 0.002, 0.02, 59, 130, 246, 220)
    DrawRect(0.5, 0.5, 0.02, 0.002, 59, 130, 246, 220)

    local left, pad, top, lh = 0.018, 0.010, 0.30, 0.020
    local name = ray.hit and (Config.DoorNames[ray.model] or ray.modelName) or 'nothing'
    DrawRect(left + 0.095, top + 0.045, 0.19, 0.115, 12, 14, 20, 170)
    DrawRect(left, top + 0.045, 0.0018, 0.115, 59, 130, 246, 230)

    SetTextColour(90, 150, 255, 255); SetTextFont(4); SetTextScale(0.30, 0.30)
    SetTextEntry('STRING'); AddTextComponentString('DOOR CREATOR'); DrawText(left + pad, top)

    local function line(t, y, dim)
        SetTextFont(4); SetTextScale(dim and 0.28 or 0.31, dim and 0.28 or 0.31)
        SetTextColour(235, 240, 250, dim and 150 or 235)
        SetTextEntry('STRING'); AddTextComponentString(t); DrawText(left + pad, y)
    end
    if ray.hit then
        line(name, top + lh)
        line(('%.2f, %.2f, %.2f'):format(ray.coords.x, ray.coords.y, ray.coords.z), top + lh * 2, true)
    else
        line('aim at a door', top + lh, true)
    end
    line('[E] capture   [Backspace] exit', top + lh * 3, true)
end

---Draw captured door markers + live aim highlight.
function LVToolsDoorlocks.Tick()
    if not (aiming or LVToolsState.IsModuleActive('doorlocks')) then return end

    for _, d in ipairs(doors) do
        local c = d.objCoords
        DrawMarker(0, c.x, c.y, c.z + 1.0, 0, 0, 0, 0, 0, 0, 0.3, 0.3, 0.3, 59, 130, 246, 200, false, true, 2, false, nil, nil, false)
        DrawText3D(vector3(c.x, c.y, c.z + 1.3), ('#%d %s'):format(d.id, d.objName ~= '' and d.objName or ('hash ' .. (d.objHash or 0))))
    end

    if aiming then
        local ray = LVToolsRaycast.CastNow(20.0)
        if ray.hit then
            DrawMarker(20, ray.coords.x, ray.coords.y, ray.coords.z + 0.4, 0, 0, 0, 180.0, 0, 0, 0.2, 0.2, 0.2, 59, 130, 246, 220, false, true, 2, false, nil, nil, false)
        end
        DrawHud(ray)

        -- Prevent E/attack from triggering game actions while aiming.
        DisableControlAction(0, CAPTURE_CONTROL, true)
        DisableControlAction(0, 24, true)
        DisableControlAction(0, 25, true)

        if IsDisabledControlJustPressed(0, CAPTURE_CONTROL) then
            CaptureFromRay()
        end
        if IsControlJustPressed(0, EXIT_CONTROL) then
            LVToolsDoorlocks.SetAim(false)
        end
    end
end

RegisterNetEvent('lv-tools:client:jobs', function(list)
    LVToolsDoorlocks.SetJobs(list)
end)
