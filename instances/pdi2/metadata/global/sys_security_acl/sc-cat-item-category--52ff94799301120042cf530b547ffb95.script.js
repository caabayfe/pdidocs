if(current.isNewRecord())
	answer=true;
else if((current.sc_category.sc_catalog.manager+'')==gs.getUserID()||(current.sc_category.sc_catalog.editors+'').indexOf(gs.getUserID())!=-1)
	answer = new SNCCatalogUtil().canRead(current.sc_cat_item);
