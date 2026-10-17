(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var currentApplicationId = gs.getCurrentApplicationId();
    var appRoutesGr = new GlideRecord('sys_ux_app_route');
    appRoutesGr.addQuery('sys_scope', currentApplicationId);
    appRoutesGr.addNullQuery('parent_macroponent_composition_element_id'); // This condition is to filter out all the content block subpages
    var routes = [];
    appRoutesGr.query();
    while (appRoutesGr.next()) {
        routes.push({
            id: appRoutesGr.getValue('route_type'),
            label: appRoutesGr.getValue('name'),
            value: appRoutesGr.getValue('route_type'),
            requiredParams: appRoutesGr.getValue('fields'),
            optionalParams: appRoutesGr.getValue('optional_parameters')
        });
    }
    return routes;

})(request, response);
