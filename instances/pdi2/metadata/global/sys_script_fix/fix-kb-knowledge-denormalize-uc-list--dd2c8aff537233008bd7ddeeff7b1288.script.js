var dicEnt = new GlideRecord('sys_dictionary');
dicEnt.addQuery('name', 'kb_knowledge');
dicEnt.addQuery('array_denormalized','false');
dicEnt.addQuery('element', 'IN', 'can_read_user_criteria,cannot_read_user_criteria');
dicEnt.query();
while(dicEnt.next()){
	if(dicEnt.getValue('element') == "can_read_user_criteria"){
		if(gs.tableExists('kb_knowledgecan_read_user_criteria')){
			var canReadTable = new GlideRecord("kb_knowledgecan_read_user_criteria");
			canReadTable.deleteMultiple();
		}
		GlideFixStuff.initGlideListArrayOptimization('kb_knowledge', 'can_read_user_criteria');
	}
	else if(dicEnt.getValue('element') == "cannot_read_user_criteria"){
		if(gs.tableExists('kb_knowledgecannot_read_user_criteria')){
			var cannotReadTable = new GlideRecord("kb_knowledgecannot_read_user_criteria");
			cannotReadTable.deleteMultiple();
		}
		GlideFixStuff.initGlideListArrayOptimization('kb_knowledge', 'cannot_read_user_criteria');
	}
}
