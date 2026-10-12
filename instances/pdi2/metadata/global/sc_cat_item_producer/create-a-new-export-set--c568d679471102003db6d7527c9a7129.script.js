setUpRecord();

function setUpRecord() {
	var table = producer.table;
	var esName =  producer.export_set;
	
	if(producer.is_definition_reference == 'no'){
		var edName = esName+'_'+table;
		var edGR = new GlideRecord('sys_export_definition');
		edGR.setValue('name', edName);
		edGR.setValue('table_name', table);
		
		var field_list = new ExportDefinitionHelper().getFields(table,'');
		edGR.setValue('field_list', field_list.toString());
		
		edSysId = edGR.insert();
	}else {
		edSysId = producer.export_definition;
	}
	
	if(producer.is_target_reference == 'no') {
		var etName = esName +'_'+producer.mid_server;
		var etGR = new GlideRecord('sys_export_target');
		etGR.setValue('name', etName);
		etGR.setValue('file_path', producer.file_path);
		etGR.setDisplayValue('mid_server', producer.mid_server);
		etSysId = etGR.insert();
	}else {
		etSysId = producer.export_target;
	}
	
	current.name = esName;
	current.export_definition = edSysId;
	current.export_target = etSysId;
	
	producer.redirect = 'sys_export_set.do?sys_id='+current.sys_id+'&from_record_producer=true';
}
