var LinkedRoute = Class.create();
LinkedRoute.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_ux_dependent_route',
    FIELDS: ['route', 'dependent_route', 'dependent_route_table'],
    FIELD_TYPES: {
        dependent_route_table: 'string',
        route: 'reference',
        dependent_route: 'reference'
    },
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },
    type: 'LinkedRoute',

	getLinkedRoutes: function(routeQuery){
		const linkedRouteGR = this.getRecordsByQuery(routeQuery, null, true);
		return linkedRouteGR;
	}
    
});
