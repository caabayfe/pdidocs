(function WriteBackAction(input) {
	var contentId =  input.sys_id;
	var table = input.type == "Article" ? "kb_knowledge" : "sc_cat_item";
	var favAPI = new sn_ex_sp.FavoriteAPI(true); 
	favAPI.createFavorite(table, contentId);
})(input);
