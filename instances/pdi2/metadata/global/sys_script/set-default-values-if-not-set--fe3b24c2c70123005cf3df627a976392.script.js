(function executeRule(current, previous /*null when async*/) {

	// scheduled import records already exists before concurrent import feature
	// do not contain default values for fields partition_method, partition_script
	// and synchronized inserts. Here we set those values for such records in case
	// someone tries to view them and enable them for concurrency

	if (GlideStringUtil.nil(current.partition_method) && GlideStringUtil.nil(current.partition_script)){
		current.synchronize_inserts = 'true';
		current.partition_method = 'roundRobin';
		current.partition_script = '(function partitionHash(import_set_row) {\n' + 
			'\n' + 
			'	// Add your code here\n' + 
			'	\n' + 
			'	// eg:\n' + 
			'	// return import_set_row.u_important_category;\n' + 
			'	// This would ensure all rows with the same \'u_important_category\' value will be in the same Import Set.\n' + 
			'\n' + 
			'	 return import_set_row.sys_import_row;\n' + 
			'\n' + 
			'})(import_set_row);';
		current.update();
	}

})(current, previous);
