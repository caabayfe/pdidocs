var pluginId = event.parm1;
    if (pluginId) {
        sn_aiux.AIUXUtils.enqueuePluginCacheEvictionEvent(pluginId, 'install');
}
