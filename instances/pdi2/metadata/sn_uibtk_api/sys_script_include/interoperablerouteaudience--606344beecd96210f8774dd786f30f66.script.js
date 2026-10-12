var InteroperableRouteAudience = Class.create();
InteroperableRouteAudience.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
	TABLE: 'sys_ux_m2m_interoperable_route_applicability',
	FIELDS: ['audience', 'interoperable_route', 'sys_id'],
    FIELD_TYPES: {
		audience: 'string',
		interoperable_route: 'string',
		sys_id: 'string'
    },
    initialize: function(fields, noDomain, includeDisplayValue) {
		BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },
    type: 'InteroperableRouteAudience',
	getInteroperableRouteAudience: function(routeQuery, orderBy) {
        let audience = this.getRecordsByQuery(routeQuery, orderBy);
		return audience;
	}
});
