fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'lv-tools'
author 'LVDevelopment'
description 'LV-Tools v2 — FiveM Developer Toolkit'
version '2.0.0'

shared_scripts {
    'shared/enums.lua',
    'shared/config.lua',
    'shared/utils.lua',
}

client_scripts {
  '@PolyZone/client.lua',
  '@PolyZone/BoxZone.lua',
  '@PolyZone/EntityZone.lua',
  '@PolyZone/CircleZone.lua',
  '@PolyZone/ComboZone.lua',

  'client/state.lua',
  'client/nui.lua',
  'client/coords.lua',
  'client/raycast.lua',
  'client/polyzones.lua',
  'client/doorlocks.lua',
  'client/props.lua',
  'client/markers.lua',
  'client/measurements.lua',
  'client/clipboard.lua',
  'client/devcam.lua',
  'client/debug.lua',
  'client/gizmo.lua',
  'client/main.lua',
}

server_scripts {
  'server/framework.lua',
  'server/permissions.lua',
  'server/save.lua',
  'server/exports.lua',
  'server/main.lua',
}

ui_page 'ui/dist/index.html'

files {
  'ui/dist/index.html',
  'ui/dist/**/*',
  'data/*.json',
}

dependencies {
  'PolyZone',
}
