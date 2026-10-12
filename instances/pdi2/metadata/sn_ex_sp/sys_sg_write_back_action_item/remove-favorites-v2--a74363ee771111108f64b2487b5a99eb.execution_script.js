(function WriteBackAction(parm_input, parm_variable) {
	var sysId = parm_variable.sysId;
	var table = parm_variable.table;
    
	var fav = new sn_ex_sp.FavoriteAPI(true);
	fav.removeFavorite(table, sysId);
})(parm_input, parm_variable);
