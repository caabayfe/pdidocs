var viewGr = new GlideRecord('sys_ui_view');
viewGr.addQuery('name', 'STARTSWITH', 'cmdb_data_cert_');
viewGr.addQuery('sys_created_on', '<', gs.daysAgo(7));
viewGr.query();
while(viewGr.next()) {
	sn_cmdb_data_manager.CMDBDataManagerScopedScriptableApis.deleteCertificationView(viewGr.getValue('name'));
}
