(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var wish_list_title = "wish_list";
	var layoutGr = new GlideRecord("sc_layout");
	if (layoutGr.get("197d6b27c3031200d68d3b0ac3d3ae85"))
		wish_list_title = layoutGr.getValue("title");
	
	g_scratchpad.wish_list_warning_msg = gs.getMessage("By turning this off you will impact users who have items in {0}. All items that are not associated to additional catalogs will be deleted for them if you continue", wish_list_title);
	g_scratchpad.cart_layouts = gs.getProperty('glide.sc.use_cart_layouts', false);
	g_scratchpad.doctype_mode = gs.getProperty('glide.ui.doctype', true);

})(current, previous);
