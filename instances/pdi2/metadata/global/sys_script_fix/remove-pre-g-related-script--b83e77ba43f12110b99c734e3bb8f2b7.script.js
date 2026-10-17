var sysScriptGr = new GlideRecord('sys_script');
sysScriptGr.addQuery('sys_id', 'IN', ['2450c0003702120069da03488e41f1d5', '210c00803702120069da03488e41f1e4']);
sysScriptGr.addQuery('active', false);
sysScriptGr.query();

while (sysScriptGr.next()) {
	if (sysScriptGr.getValue('sys_mod_count') < 2) {
		var sysUpdateGr = new GlideRecord('sys_update_xml');
		sysUpdateGr.addQuery('name', sysScriptGr.getValue('sys_update_name'));
		sysUpdateGr.setValue('replace_on_upgrade', true);
		sysUpdateGr.updateMultiple();
	}
}
