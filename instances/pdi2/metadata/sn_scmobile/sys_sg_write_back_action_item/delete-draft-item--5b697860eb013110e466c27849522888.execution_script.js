(function WriteBackAction(input) {
	// Type appropriate comment here, and begin script below
    var gr = new GlideRecord("sc_cart_item");
    gr.get(input.sys_id);
    if (gr.isValidRecord() && !gr.cat_item.nil()) {
        var tableName = gr.cat_item.table_name
        var cartRecord = new sn_sc.CartJS("draft_items");
        cartRecord.remove(input.sys_id);
        if (!gs.nil(tableName))
            new global.GlobalServiceCatalogUtil().deleteAttachments(tableName, input.sys_id);
    }
})(input);
