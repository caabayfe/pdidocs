(function executeRule(current, previous /*null when async*/ ) {
    var ui_section = current.sys_ui_section;
    var gr = new GlideRecord("sys_ui_section");
    if (gr.get(ui_section)) {
        if (gr.getDisplayValue("view") == "sa_map_properties") {
            sn_scoped_cache.ScopedCacheManager.flushScopedCache("SA_MAP_VIEW_PROPERTIES_CACHE");
        }
    }
})(current, previous);
