function script({ api, event, helpers, imports }) {
    // Fire event to indicate settings have been successfully saved
    api.emit('UNIFIED_MAP#SETTINGS_CHANGED', {});
}
