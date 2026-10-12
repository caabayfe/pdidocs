(function executeRule(current, previous /*null when async*/) {
	
	function shouldRemoveWishListItem(item_id) {
		var catalog_item_m2m = new GlideRecord("sc_cat_item_catalog");
		catalog_item_m2m.addActiveQuery();
		catalog_item_m2m.addQuery("sc_cat_item", item_id);
		catalog_item_m2m.addQuery("sc_catalog.enable_wish_list", true);
		catalog_item_m2m.setLimit(1);
		catalog_item_m2m.query();
		return catalog_item_m2m.getRowCount() == 0;
	}

	//Check if there are any saved items in the wish lists. If any delete carts
	//of all the users and their corresponding cart items
	var cartName = "saved_items";
	var cartUserMap = {};//Need this for CartJS. Avoids couple queries
	var cartGr = new GlideRecordSecure("sc_cart");
	cartGr.addActiveQuery();
	cartGr.addQuery("name", cartName);
	cartGr.query();
	while (cartGr.next())
		cartUserMap[cartGr.getUniqueValue()] = cartGr.getValue("user");
	
	var cartItemGr = new GlideRecordSecure("sc_cart_item");
	var cart_id = "";
	var cartJS = "";
	cartItemGr.addActiveQuery();
	cartItemGr.addQuery("cart.name", cartName);
	cartItemGr.orderBy("cart");
	cartItemGr.query();
	while (cartItemGr.next()) {
		if (cartItemGr.getValue("cart") != cart_id) {
			cart_id = cartItemGr.getValue("cart");
			cartJS = new sn_sc.CartJS(cartName, cartUserMap[cart_id]);
		}
		if (shouldRemoveWishListItem(cartItemGr.getValue("cat_item")))
			cartJS.remove(cartItemGr.getUniqueValue());
	}
	
})(current, previous);
