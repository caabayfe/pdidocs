function perform(){
	var name = g_form.getValue('name');
	var id = g_form.getUniqueValue();
	
	MagellanCreateFavorites.addFavorite({
									title : name,
									icon : 'tree',
									url: '/$sw_dashboards.do?sysparm_viewid='+id
								});
	
}
