var PROPERTY_NAME = 'sn_itam_restrict_asset_read';

var gr = new GlideRecord('sys_properties');
gr.addQuery('name', PROPERTY_NAME);
gr.query();
if (gr.next()) {
	var updated = false;
	if (gr.getValue('read_roles') === 'admin') {
		gr.setValue('read_roles', 'asset_system_admin');
		updated = true;
	}
	if (gr.getValue('write_roles') === 'admin') {
		gr.setValue('write_roles', 'asset_system_admin');
		updated = true;
	}
	if (updated) {
		gr.update();
		gs.log('DEF0855524: Updated ' + PROPERTY_NAME + ' roles to asset_system_admin', 'AssetReadACL');
	} else {
		gs.log('DEF0855524: ' + PROPERTY_NAME + ' roles already set — no update needed', 'AssetReadACL');
	}
} else {
	gs.log('DEF0855524: Property ' + PROPERTY_NAME + ' not found — skipping', 'AssetReadACL');
}
