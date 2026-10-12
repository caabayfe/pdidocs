(function executeQuery(v_table, v_query) {
	var start = v_query.getFirstRowWanted();
	var end = v_query.getLastRowWanted();
	var index = -1;
	
	//reset the window for glide record
	v_query.setFirstRowWanted(0);
	v_query.setLastRowWanted(end - start);
	
	var portalCatalogs = new sn_scmobile.MobileCatalogUtil().getCatalogsInPortal('mesp').value || '';
	portalCatalogs = portalCatalogs.split(',');
	portalCatalogs.forEach(function (catalogID) {
		var catalogObj = new sn_sc.Catalog(catalogID);
		if (catalogObj == null || !catalogObj.canView())
			return;
		
		index++;
		if (index < start)
			return;
		if (index >= end)
			return;
		
		var row = {};
		row.sys_id = catalogObj.getID();
		row.title = catalogObj.getTitle();
		row.short_description = catalogObj.getDescription();
		row.picture = catalogObj.getDesktopImageSRC();
		row.picture = row.picture || '';
		row.picture = row.picture.substring(0,32);
		row.table = 'sc_catalog';
		v_table.addRow(row);
	});
  })(v_table, v_query);
