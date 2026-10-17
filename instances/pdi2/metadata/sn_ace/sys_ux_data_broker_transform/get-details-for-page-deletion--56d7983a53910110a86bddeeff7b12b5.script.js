function transform(input) {
    var uxAppRouteId = input.uxAppRouteId;
    if (!uxAppRouteId) {
        return {};
    }

    var uxAppRouteGr = new GlideRecord('sys_ux_app_route');
    if (uxAppRouteGr.get(uxAppRouteId)) {
        var screenCollectionId = uxAppRouteGr.getValue('screen_type');
        var uxAppConfigId = uxAppRouteGr.getValue('app_config');
    }
	
    return {
        uxAppConfigId: uxAppConfigId,
        screenCollectionId: screenCollectionId
    };
}
