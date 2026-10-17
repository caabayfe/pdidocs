var VANotificationActionRefQual = Class.create();

VANotificationActionRefQual.getTopicsForModelType = function(current) {

	var topicSysIDList = [];
	var encodedQuery = 'active=true^published=true^libraryISEMPTY^ORlibrary=false^is_system_topicISEMPTY^ORis_system_topic=false';
	var topicGr = new GlideRecord('sys_cs_topic');
	
	if (current.model_type == 'nlu_keyword') 
		encodedQuery += '^model_type=^ORmodel_type=nlu_keyword';
	
	if (current.model_type == 'llm') 
		encodedQuery += '^model_type=llm';
	
	topicGr.addEncodedQuery(encodedQuery);
	topicGr.query();

	while(topicGr.next())
		topicSysIDList.push(topicGr.getValue('sys_id'));

	return 'sys_idIN' + topicSysIDList.join(',');
};
