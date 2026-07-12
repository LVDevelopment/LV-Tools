-- LV-Tools v2 Server Entry Point
CreateThread(function()
    Wait(500)
    print(('^2[LV-Tools v2]^0 started — framework: ^5%s^0'):format(LVToolsFramework.Detect()))
end)

RegisterNetEvent('lv-tools:server:getJobs', function()
    local src = source
    TriggerClientEvent('lv-tools:client:jobs', src, LVToolsFramework.GetJobs())
end)
