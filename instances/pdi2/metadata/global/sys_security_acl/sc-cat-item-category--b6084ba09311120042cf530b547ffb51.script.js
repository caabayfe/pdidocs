if(!current.sc_category || current.sc_category.sc_catalog.manager.toString()==gs.getUserID()||(current.sc_category.sc_catalog.editors.toString()).indexOf(gs.getUserID())!=-1)
	answer = new SNCCatalogUtil().canCreate(current.sc_cat_item);
