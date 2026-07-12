LVToolsProps = {}

local props = {}
local nextId = 1

---Serialize a prop entry for NUI transport.
---@param entry table
---@return table
local function Serialize(entry)
    return {
        id = entry.id,
        model = entry.model,
        modelName = entry.modelName,
        coords = entry.coords,
        heading = entry.heading,
        frozen = entry.frozen,
    }
end

---@return table
function LVToolsProps.GetAll()
    local list = {}
    for _, entry in pairs(props) do
        list[#list + 1] = Serialize(entry)
    end
    return { props = list }
end

---Request and load a model, returns hash or nil.
---@param modelName string|number
---@return number|nil
local function RequestModelSync(modelName)
    local hash = type(modelName) == 'number' and modelName or joaat(modelName)
    if not IsModelValid(hash) then
        return nil
    end

    RequestModel(hash)
    local timeout = GetGameTimer() + 5000
    while not HasModelLoaded(hash) and GetGameTimer() < timeout do
        Wait(0)
    end

    return HasModelLoaded(hash) and hash or nil
end

---Resolve placement coords: raycast hit or in front of the player.
---@param mode string|nil 'raycast' | 'player'
---@return vector3, number
local function GetPlacement(mode)
    local ped = PlayerPedId()
    local heading = GetEntityHeading(ped)

    if mode == 'raycast' then
        local ray = LVToolsRaycast.CastNow()
        if ray.hit then
            return vector3(ray.coords.x, ray.coords.y, ray.coords.z), heading
        end
    end

    local coords = GetOffsetFromEntityInWorldCoords(ped, 0.0, 2.0, 0.0)
    return coords, heading
end

---@param data table
---@return table
function LVToolsProps.HandleAction(data)
    local action = data.action

    if action == 'spawn' then
        local hash = RequestModelSync(data.model)
        if not hash then
            return { success = false, error = 'Invalid model: ' .. tostring(data.model) }
        end

        local coords, heading = GetPlacement(data.placement)
        local obj = CreateObject(hash, coords.x, coords.y, coords.z, true, true, false)
        PlaceObjectOnGroundProperly(obj)
        SetEntityHeading(obj, heading)
        SetModelAsNoLongerNeeded(hash)

        local id = nextId
        nextId = nextId + 1
        props[id] = {
            id = id,
            entity = obj,
            model = hash,
            modelName = tostring(data.model),
            coords = LVTools.Vec3ToTable(GetEntityCoords(obj)),
            heading = LVTools.Round(heading),
            frozen = false,
        }

        LVToolsNUI.Notify('Spawned ' .. tostring(data.model), LVToolsNotifyType.SUCCESS)
        return { success = true, props = LVToolsProps.GetAll().props }

    elseif action == 'delete' then
        local entry = props[data.id]
        if entry then
            if DoesEntityExist(entry.entity) then DeleteEntity(entry.entity) end
            props[data.id] = nil
            return { success = true, props = LVToolsProps.GetAll().props }
        end
        return { success = false, error = 'Prop not found' }

    elseif action == 'freeze' then
        local entry = props[data.id]
        if entry and DoesEntityExist(entry.entity) then
            entry.frozen = not entry.frozen
            FreezeEntityPosition(entry.entity, entry.frozen)
            return { success = true, props = LVToolsProps.GetAll().props }
        end
        return { success = false, error = 'Prop not found' }

    elseif action == 'clear' then
        for _, entry in pairs(props) do
            if DoesEntityExist(entry.entity) then DeleteEntity(entry.entity) end
        end
        props = {}
        LVToolsNUI.Notify('Cleared all props', LVToolsNotifyType.INFO)
        return { success = true, props = {} }

    elseif action == 'copy' then
        local entry = props[data.id]
        if entry then
            local text = ('vector4(%.2f, %.2f, %.2f, %.2f)'):format(
                entry.coords.x, entry.coords.y, entry.coords.z, entry.heading)
            LVToolsNUI.CopyToClipboard(text)
            LVToolsClipboard.Add(text, 'prop')
            return { success = true, text = text }
        end
        return { success = false, error = 'Prop not found' }

    elseif action == 'export' then
        local list = {}
        for _, entry in pairs(props) do
            list[#list + 1] = {
                model = entry.modelName,
                coords = entry.coords,
                heading = entry.heading,
            }
        end
        local text = json.encode(list)
        LVToolsNUI.CopyToClipboard(text)
        return { success = true, text = text }
    end

    return { success = false, error = 'Unknown action' }
end

---Props are static; nothing per-frame required.
function LVToolsProps.Tick() end
