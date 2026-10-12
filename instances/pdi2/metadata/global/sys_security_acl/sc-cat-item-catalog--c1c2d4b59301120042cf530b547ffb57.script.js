if((current.sc_catalog.manager+'')==gs.getUserID()||(current.sc_catalog.editors+'').indexOf(gs.getUserID())!=-1)
	answer = new SNCCatalogUtil().canDelete(current.sc_cat_item);
