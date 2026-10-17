function transform(input) {
	if(GlidePluginManager.isActive("com.sn_awa_gen_ai")){
		var recordGr = new GlideRecord(input.table);
		if(recordGr.get(input.sys_id) && recordGr.canRead()){
			var wrapUpGenAIUtil = new sn_awa_gen_ai.wrapUpAICompletionUtil();
			if(!gs.nil(wrapUpGenAIUtil._getAndValidateActiveSkill(recordGr))){
				return true;
			}
		}
	}
	return false;
}
