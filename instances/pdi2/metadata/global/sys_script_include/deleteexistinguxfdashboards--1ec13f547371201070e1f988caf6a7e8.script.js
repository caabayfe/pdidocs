var DeleteExistingUxfDashboards = Class.create();
DeleteExistingUxfDashboards.prototype = {
    initialize: function() {
    },
	deleteDashboards: function() {
		var ux_screen = new GlideRecord('sys_ux_screen');
		ux_screen.addEncodedQuery('parent_macroponent=3119f143532510102b54ddeeff7b126e^');
		ux_screen.query();
		while (ux_screen.next()) {
			var screen_type = new GlideRecord('sys_ux_screen_type');
			screen_type.get(ux_screen.getValue('screen_type'));
			screen_type.deleteRecord();
			var macroponent = new GlideRecord('sys_ux_macroponent');
			macroponent.get(ux_screen.getValue('macroponent'));
			macroponent.deleteRecord();
			ux_screen.deleteRecord();
		}
		var app_route = new GlideRecord('sys_ux_app_route');
		app_route.addEncodedQuery('parent_macroponent=3119f143532510102b54ddeeff7b126e^');
		app_route.query();
		while (app_route.next()) {
			var route_permission = new GlideRecord('sys_ux_route_permission');
			route_permission.addQuery('route','');
			route_permission.query();
			while(route_permission.next()) {
				route_permission.deleteRecord();
			}
			app_route.deleteRecord();
		}

	},
    type: 'DeleteExistingUxfDashboards'
};
