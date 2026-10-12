enableResponsiveDashboards();

/*
If we are upgrading and the property to enable Responsive Dashboards is set to false, we want the value to be true. On zBoot the property is by default true.
If the property does not exist on the customer instance, there is no need to add it as part of this script, since it will be added as part of 'Add dashboard properties' fix script ( sys_script_fix_1fd118d2b310030037c482ff86a8dc03).
*/
function enableResponsiveDashboards() {
	if (!pm.isZboot() && gs.getProperty('glide.cms.enable.responsive_grid_layout') === 'false') { // upgrading and property exist but is set to false
		var systemPropertiesGR = new GlideRecord('sys_properties');
		systemPropertiesGR.addQuery('name', 'glide.cms.enable.responsive_grid_layout');
		systemPropertiesGR.query();
		if (systemPropertiesGR.next()) {
			systemPropertiesGR.setValue('value', true);
			systemPropertiesGR.update();
		}
	}  // else property is already set to true or scripts run on a zbooted instance, in which case we don't do anything since the property will be set as true by default
}
