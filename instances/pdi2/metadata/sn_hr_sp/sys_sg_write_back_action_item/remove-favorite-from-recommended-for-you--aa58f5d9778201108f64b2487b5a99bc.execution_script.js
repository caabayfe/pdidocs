(function WriteBackAction(input) {
    var contentId = input.sys_id;
	var table = input.type == "Article" ? "kb_knowledge" : "sc_cat_item";
	var favAPI = new sn_ex_sp.FavoriteAPI(true); 
	favAPI.removeFavorite(table, contentId); 
})(input);
