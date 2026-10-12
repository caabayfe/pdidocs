

renameInstallStatus();

function renameInstallStatus() {
	if(!pm.isZboot()) {
		var gr = new GlideRecord('sys_dictionary');
		gr.addEncodedQuery('name=cmdb^element=install_status');
		gr.query();
		if(gr.getRowCount() == 1 && gr.next() && gr.getValue('column_label') == 'Status') {
			gr.setValue('column_label','Install Status');
			gs.info("For 'Base Configuration Item'(cmdb) table, updating label of 'Status' to 'Install Status'");
			gr.update();
		}
}}
