var prop = new GlideRecord('sys_properties');
if (prop.get('name', 'change.refresh_impacted.include_affected_cis')) {
	prop.setValue('name', 'com.snc.change_request.refresh_impacted.include_affected_cis');
	prop.update();
}
