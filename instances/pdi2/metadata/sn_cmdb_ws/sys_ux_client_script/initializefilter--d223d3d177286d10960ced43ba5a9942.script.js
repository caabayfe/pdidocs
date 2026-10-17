function script({ api, event, helpers, imports }) {
    //initializeFilter script in Map Search Filter UI Controller; fired after all brokers complete fetch
    const { LAYER, cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
    const { EVENTS } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

    //assign the layer IDs (for the checkbox identifier used in checkbox event payload)
    var filterControls = cloneDeep(api.state.filterControls);
    var layer = filterControls.layer;
    layer.selectAll.id = LAYER.SELECT_ALL.ID;
    layer.business.id = LAYER.BUSINESS.ID;
    layer.applicationService.id = LAYER.APPLICATION_SERVICE.ID;
    layer.application.id = LAYER.APPLICATION.ID;
    layer.infrastructure.id = LAYER.INFRASTRUCTURE.ID;

    //assign the layer name (same as latter half of ID, but will need to reference a lot)
    layer.selectAll.name = LAYER.SELECT_ALL.NAME;
    layer.business.name = LAYER.BUSINESS.NAME;
    layer.applicationService.name = LAYER.APPLICATION_SERVICE.NAME;
    layer.application.name = LAYER.APPLICATION.NAME;
    layer.infrastructure.name = LAYER.INFRASTRUCTURE.NAME;

    // assign the layer display values (i18n)
    layer.selectAll.displayName = api.state.translations.LAYER.SELECT_ALL;
    layer.business.displayName = api.state.translations.LAYER.BUSINESS;
    layer.applicationService.displayName = api.state.translations.LAYER.APPLICATION_SERVICE;
    layer.application.displayName = api.state.translations.LAYER.APPLICATION;
    layer.infrastructure.displayName = api.state.translations.LAYER.INFRASTRUCTURE;

    layer.selectAll.key = LAYER.SELECT_ALL.KEY;
    layer.business.key = LAYER.BUSINESS.KEY;
    layer.applicationService.key = LAYER.APPLICATION_SERVICE.KEY;
    layer.application.key = LAYER.APPLICATION.KEY;
    layer.infrastructure.key = LAYER.INFRASTRUCTURE.KEY;

    api.setState('filterControls', filterControls);

    helpers.timing.setTimeout(() => {
        api.emit(EVENTS.EVENT_SYNC, {
            originatingEvent: EVENTS.FILTER_INITIALIZED,
            syncEvent: EVENTS.STATE_INITIALIZED,
            clearOnSync: true
        });
    }, 0);
}
