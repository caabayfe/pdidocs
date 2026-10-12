var removeInactiveItems = gs.getProperty('glide.sc.remove_inactive_cat_items_from_cart');
if (!JSUtil.nil(removeInactiveItems) && removeInactiveItems == 'true')
	removeCartItemsWhenInactive();

function removeCartItemsWhenInactive() {
	var scCartItemGr = new GlideRecord('sc_cart_item');
	scCartItemGr.addQuery('cat_item', current.sys_id);
	scCartItemGr.query();
	
	while (scCartItemGr.next()) {
		var gAppCartItem = GlideappCartItem.get(scCartItemGr);
		gAppCartItem.removeCartItem();
	}
	gs.addInfoMessage(gs.getMessage('This catalog item has been removed from all shopping carts'));
}
