fixSPSearchAsYouTypeProperty();

function fixSPSearchAsYouTypeProperty () {
	if (pm.isZboot())
		return; // value already correct OOB

	var propertyGR = new GlideRecord("sys_properties");
	if (!propertyGR.get("name", "glide.service_portal.search_as_you_type_behavior"))
		return; // no record found, nothing to do

	// Change from OOB "suggestions" to "typeahead" for upgrades to avoid changing existing instance behavior.
	// A "before" glidefix has already written out an update for upgrades that already had the property.
	propertyGR.setValue('value', 'typeahead');

	// turn workflow on so an update is written out to prevent future regression
	var wf = gs.getSession().setWorkflow(true);
	propertyGR.update();
	gs.getSession().setWorkflow(wf);
}
