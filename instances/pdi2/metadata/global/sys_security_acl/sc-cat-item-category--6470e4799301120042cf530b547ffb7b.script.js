if(current.sc_category.sc_catalog.manager.toString()==gs.getUserID()||(current.sc_category.sc_catalog.editors.toString()).indexOf(gs.getUserID())!=-1)
	answer = new SNCCatalogUtil().canDelete(current.sc_cat_item);
