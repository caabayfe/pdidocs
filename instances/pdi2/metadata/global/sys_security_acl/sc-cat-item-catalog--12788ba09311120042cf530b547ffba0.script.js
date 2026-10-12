if(!current.sc_catalog || current.sc_catalog.manager.toString()==gs.getUserID()||(current.sc_catalog.editors.toString()).indexOf(gs.getUserID())!=-1)
	answer = new SNCCatalogUtil().canCreate(current.sc_cat_item);
