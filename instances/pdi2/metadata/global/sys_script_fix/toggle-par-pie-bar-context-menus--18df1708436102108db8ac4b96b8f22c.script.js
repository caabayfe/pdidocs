function queryGlideRecord(encodedQuery) {
    var gr = new GlideRecord("sys_ui_context_menu");
    gr.addEncodedQuery(encodedQuery);
    gr.query();
    return gr;
}

function updateActiveField(gr, activeValue) {
    while (gr.next()) {
        gr.active = activeValue;
        gr.update();
    }
}

if (!pm.isZboot()) {
    var coreContextMenuQuery = 'sys_idINcc97e1240a0a0b3e004a493f398feef8,ccb397090a0a0b3e00b2ce638f5d6df0';
    var nextContextMenuQuery = 'sys_idIN4e844f3f431502108db8ac4b96b8f2eb,8ca4cf3f431502108db8ac4b96b8f225';
    var unifiedAnalyticsProp = gs.getProperty("com.glide.par.unified_analytics.enabled", "false");

    var coreContextMenus;
    var nextExpContextMenus;

    if (unifiedAnalyticsProp === "true") {
        coreContextMenus = queryGlideRecord(coreContextMenuQuery);
        nextExpContextMenus = queryGlideRecord(nextContextMenuQuery);

        updateActiveField(coreContextMenus, false);
        updateActiveField(nextExpContextMenus, true);
    } else {
        coreContextMenus = queryGlideRecord(coreContextMenuQuery);
        nextExpContextMenus = queryGlideRecord(nextContextMenuQuery);

        updateActiveField(coreContextMenus, true);
        updateActiveField(nextExpContextMenus, false);
    }
}
