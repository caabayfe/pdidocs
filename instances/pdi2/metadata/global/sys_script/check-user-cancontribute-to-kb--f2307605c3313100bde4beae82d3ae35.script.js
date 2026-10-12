function onBefore(current,previous){
	var gr = new GlideRecord("kb_knowledge_base");
	gr.get(current.kb_knowledge_base);
	if(gr.kb_version == "2"){
		if(!current.canWrite()){
			gs.addErrorMessage(gs.getMessage('You do not have permission to contribute to this knowledge base.'));
			current.setAbortAction(true);
			current.kb_knowledge_base = "";
		}
	}else{

		if(pm.isActive('com.snc.knowledge_advanced') && new KBOwnershipGroup().isMemberOfValidOwnershipGroup(current))
			return true;
		
		var knowledgeHelper = new SNC.KnowledgeHelper();
		if (!knowledgeHelper.canContribute(gr)){
			gs.addErrorMessage(gs.getMessage('You do not have permission to contribute to this knowledge base.'));
			current.setAbortAction(true);
		}
	}
}
