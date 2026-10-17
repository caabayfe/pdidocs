(function(gr) {
	var modelId = "";
	if (!gs.nil(gr.model))
		modelId = gr.model + "";
	
	if (!gs.nil(gr.model_id) || gr.model_id.changes())
		modelId = gr.model_id + "";
	
	gr.model_id = modelId;
	gr.model = modelId;
	
	if (isLegacyVar())
		gr.name = "var__m_" + modelId;
	else
		gr.name = "var__m_" + gr.sys_class_name + "_" + modelId;
	
	function isLegacyVar() {
		var varDic = new GlideRecord("var_dictionary");
		varDic.addQuery("name", "var__m_" + gr.model_id);
		varDic.query();
		if (varDic.next())
			return true;
		
		return false;
	}
})(current);
