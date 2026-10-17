(function() {
    if (!event.parm1) {
        return;
    }

    try {
        var data = JSON.parse(event.parm1);
        var eventType = data.event_type;

        if (['uninstall', 'delete', 'rollback'].indexOf(eventType) !== -1) {
            var pluginId = data.scope || data.id;
            if (pluginId) {
                sn_aiux.AIUXUtils.enqueuePluginCacheEvictionEvent(pluginId, eventType);
            }
        }
    } catch (e) {
        gs.error('AIUX Cache Eviction - Plugin Uninstalled: Failed to process on.demand.app.lifecycle event | ' + e.message);
    }
})();
