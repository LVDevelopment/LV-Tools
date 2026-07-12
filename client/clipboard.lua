LVToolsClipboard = {}

local MAX_ENTRIES = 100
local entries = {}
local favorites = {}

---@param text string
---@param format string|nil
function LVToolsClipboard.Add(text, format)
    table.insert(entries, 1, {
        id = ('clip_%d'):format(GetGameTimer()),
        text = text,
        format = format or 'text',
        timestamp = GetGameTimer(),
        pinned = false,
    })

    while #entries > MAX_ENTRIES do
        table.remove(entries)
    end

    if LVToolsNUI.IsOpen() then
        LVToolsNUI.Send('clipboardUpdate', LVToolsClipboard.GetAll())
    end
end

---@return table
function LVToolsClipboard.GetAll()
    return {
        entries = entries,
        favorites = favorites,
    }
end

---@param data table
---@return table
function LVToolsClipboard.HandleAction(data)
    local action = data.action

    if action == 'copy' then
        for _, entry in ipairs(entries) do
            if entry.id == data.id then
                LVToolsNUI.CopyToClipboard(entry.text)
                return { success = true }
            end
        end
        return { success = false }

    elseif action == 'delete' then
        for i, entry in ipairs(entries) do
            if entry.id == data.id then
                table.remove(entries, i)
                break
            end
        end
        return { success = true, data = LVToolsClipboard.GetAll() }

    elseif action == 'pin' then
        for _, entry in ipairs(entries) do
            if entry.id == data.id then
                entry.pinned = not entry.pinned
                break
            end
        end
        return { success = true, data = LVToolsClipboard.GetAll() }

    elseif action == 'favorite' then
        favorites[#favorites + 1] = {
            id = data.id,
            text = data.text,
            label = data.label or 'Favorite',
        }
        return { success = true, data = LVToolsClipboard.GetAll() }

    elseif action == 'clear' then
        entries = {}
        return { success = true, data = LVToolsClipboard.GetAll() }

    elseif action == 'export' then
        return { success = true, json = json.encode(LVToolsClipboard.GetAll()) }
    end

    return { success = false }
end
