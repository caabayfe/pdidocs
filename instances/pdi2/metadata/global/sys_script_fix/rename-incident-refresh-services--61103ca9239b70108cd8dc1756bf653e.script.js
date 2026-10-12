var prop = new GlideRecord('sys_properties');
if (prop.get('name', 'incident.refresh_impacted.include_affected_cis')) {
	prop.setValue('name', 'com.snc.incident.refresh_impacted.include_affected_cis');
	prop.update();
}
