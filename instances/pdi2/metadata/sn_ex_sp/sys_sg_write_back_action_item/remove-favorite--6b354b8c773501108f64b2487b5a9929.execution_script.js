(function WriteBackAction(input) {
    var sysId = input.sys_id;
	var table = input.table;
    var fav = new sn_ex_sp.FavoriteAPI(true);
	fav.removeFavorite(table, sysId);
})(input);
