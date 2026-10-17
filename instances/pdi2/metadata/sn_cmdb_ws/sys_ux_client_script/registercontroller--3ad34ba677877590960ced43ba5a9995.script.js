function script({ api, event, helpers, imports }) {
    //registerController script in Related Items controller; event fired after macroponent ready to turn on performance logging
    api.emit('SN_UNIFIED_MAP#REGISTER_CONTROLLER', { controllerId: event.elementId });
}
