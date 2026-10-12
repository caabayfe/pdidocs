var InteroperableRoute = Class.create();
InteroperableRoute.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
	TABLE: 'sys_ux_interoperable_route',
	FIELDS: ['alias_route', 'active', 'description', 'interoperable_condition', 'interoperable_name', 'interoperable_order', 'screens', 'source_route', 'target_experience', 'sys_updated_on', 'sys_updated_by', 'sys_created_on'],
    FIELD_TYPES: {
		alias_route: 'string',
		active: 'boolean',
		description: 'string',
		interoperable_condition: 'string',
		interoperable_name: 'string',
		interoperable_order: 'integer',
		screens: 'list',
		source_route: 'reference',
		target_experience: 'reference'
    },
    initialize: function(fields, noDomain, includeDisplayValue) {
		BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },

    type: 'InteroperableRoute',
	getInteroperableRoutes: function(routeQuery, orderBy) {
        let routes = this.getRecordsByQuery(routeQuery, orderBy);
		return routes;
	}
});
