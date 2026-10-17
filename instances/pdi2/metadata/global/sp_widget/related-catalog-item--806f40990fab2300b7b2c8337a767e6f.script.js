(function() {
  
	data.catalogs = [];
	options.title = options.title || gs.getMessage("Related Items");
	var limit = options.max_number || 5;
	
	var source_id = $sp.getParameter(options.source_id) || $sp.getParameter('sys_id');
	
	var edit_parm = $sp.getParameter('edit');
	var is_cart_item = edit_parm == 'cart';
	var is_wishlist_item = edit_parm == 'wishlist';
	var is_draft_item = edit_parm == 'draft';
	
	if(is_cart_item || is_draft_item || is_wishlist_item){
		var cartItem = new GlideRecord("sc_cart_item");
		if(cartItem.get(source_id)){
			source_id = cartItem.getValue("cat_item");
		}
	}
	
	var count = 0;
	var sys_id_list=[];
	
	/* If user doesn't have access to source record, do not display related items. */
	if(options.source_column == 'kb_knowledge') {
		var sourceRecord = new GlideRecordSecure('kb_knowledge');
		if (gs.nil(source_id)) {
			var article_number = $sp.getParameter('sysparm_article');
			sourceRecord.addQuery('number', article_number);
			sourceRecord.orderByDesc('version.sys_created_on');
			sourceRecord.query();
			if (sourceRecord.next())
				source_id = sourceRecord.sys_id;
			else
				return;
		}
		else {
			if(!sourceRecord.get(source_id))
				return;
		}
	}
	else if(options.source_column == 'sc_cat_item') {
		var sourceRecord = new sn_sc.CatItem(source_id + "");
		if(!sourceRecord.canView())
			return;
	}
	
	var catalog_query_operator = "IN";
	var catalogs = $sp.getCatalogs().value;
	if(!gs.nil(catalogs) && catalogs.indexOf(",") === -1) {
		// If the ServicePortal has only one catalog configured
		catalog_query_operator = "CONTAINS";
	}
	/* Secure access check for the options.source_table */
	if (options.source_table && !new global.SPWidgetAccessControl().hasPublicAccess(options.source_table, $sp, options, input)) {
		gs.warn("Deny access to table which is not public: " + options.source_table);
		return;
    }
	/*Query sc_2_sc and kb_2_sc to get the Related Catalog Items*/
	var gr = new GlideRecord(options.source_table);
	gr.addQuery(options.source_column, source_id);
	gr.addQuery('active',true);
	gr.addQuery(options.target_column + ".active", "true");
	gr.addQuery(options.target_column + ".visible_standalone", 'true');
	gr.addQuery(options.target_column + '.sc_catalogs', catalog_query_operator, catalogs);
	gr.orderBy('order');
	gr.orderBy(options.target_column + ".name");
	gr.query();
	while (gr.next() && count < limit) {
			/* Does not add duplicate catalog */
		if (sys_id_list.indexOf(gr.getValue(options.target_column)) >= 0)
			continue;
			
		var catalogItemJS = new sn_sc.CatItem(gr.getValue(options.target_column));
		if (!catalogItemJS.canView() || !catalogItemJS.isVisibleServicePortal())
			continue;
		
		var catalogItemDetails = catalogItemJS.getItemSummary(true, "basic");
		var relatedCatItems = {};
		relatedCatItems.sys_id = catalogItemDetails.sys_id;
		relatedCatItems.short_description = catalogItemDetails.short_description;
		relatedCatItems.name = catalogItemDetails.name;
		if (catalogItemDetails.type == 'order_guide')
				relatedCatItems.href = "?id=sc_cat_item_guide&sys_id=" + catalogItemDetails.sys_id;	
		else
				relatedCatItems.href = "?id=sc_cat_item&sys_id=" + catalogItemDetails.sys_id;	
		var picture = catalogItemDetails.picture;

		if (picture){
      			relatedCatItems.picture = picture.concat("?t=small");
      			relatedCatItems.altText = gs.getMessage("{0} icon", relatedCatItems.name);
    		}
			
		
		sys_id_list.push(relatedCatItems.sys_id);
		data.catalogs.push(relatedCatItems);
		count++;
	}
}	
)();
