(function WriteBackAction(parm_input, parm_variable) {
	var sysId = parm_variable.sysId;
	var table = parm_variable.type == "Article" ? "kb_knowledge" : "sc_cat_item";
    
	var favAPI = new sn_ex_sp.FavoriteAPI(true); 
	favAPI.removeFavorite(table, sysId);
})(parm_input, parm_variable);
