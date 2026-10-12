(function executeRule(current, previous /*null when async*/) {
	
	
		if (!current.source_table || current.source_table != 'sys_db_object') {
			gs.addErrorMessage(sn_i18n.Message.getMessage('rca.data_fabric.invalid_rca_record', 'Invalid source table for source type Data Fabric Table.'));
			current.setAbortAction(true);
			return;
		}

		var tableId = current.source;
		var gr = new GlideRecord('sys_db_object');
		gr.setWorkflow(false);
		
		if (!gr.get(tableId)) {
			gs.addErrorMessage(sn_i18n.Message.getMessage('rca.data_fabric.invalid_rca_record', 'Source table is not a valid Local Data Fabric table.'));
			current.setAbortAction(true);
			return;
		}

		var td = GlideTableDescriptor.get(gr.name);

		if (!td || !td.isValid() || !td.isLocalDataFabricTable()) {
			gs.addErrorMessage(sn_i18n.Message.getMessage('rca.data_fabric.invalid_rca_record', 'Source table is not a valid Local Data Fabric table.'));
			current.setAbortAction(true);
		}
	
	

})(current, previous);
