---LV-Tools v2 Client Entry Point
---Orchestrates modules via state machine — idle cost is near zero.

CreateThread(function()
  Wait(1000)
  TriggerServerEvent('lv-tools:server:requestPermission')
  TriggerServerEvent('lv-tools:server:load', 'zones')
  TriggerServerEvent('lv-tools:server:getJobs')
end)

-- Initialize NUI callbacks
LVToolsNUI.Init()

-- Keybind to open toolkit
RegisterCommand('lvtools', function()
  LVToolsNUI.Toggle()
end, false)

RegisterKeyMapping('lvtools', 'Open LV-Tools Developer Toolkit', 'keyboard', Config.OpenKey)

-- Main tick loop — adaptive sleep based on active modules
CreateThread(function()
  while true do
    if LVToolsState.NeedsFrameTick() then
      LVToolsCoords.Tick()
      LVToolsRaycast.Tick()
      LVToolsPolyzones.Tick()
      LVToolsMarkers.Tick()
      LVToolsDebug.Tick()
      LVToolsProps.Tick()
      LVToolsMeasurements.Tick()
      LVToolsDoorlocks.Tick()
      Wait(0)
    else
      Wait(Config.UpdateRates.idle)
    end
  end
end)

-- Push dashboard updates on slower interval when only dashboard is conceptually "watching"
-- (handled inside LVToolsCoords.Tick when dashboard tab active)
