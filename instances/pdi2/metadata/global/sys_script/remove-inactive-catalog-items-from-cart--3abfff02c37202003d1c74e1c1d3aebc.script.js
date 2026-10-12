(function executeRule(current, previous /*null when async*/) {

    var scCartItemGr = new GlideRecord('sc_cart_item');
	scCartItemGr.addQuery('cat_item.active', 'false');
    scCartItemGr.query();

    while (scCartItemGr.next()) {
		var gAppCartItem = GlideappCartItem.get(scCartItemGr);
		gAppCartItem.removeCartItem();
    }
    gs.addInfoMessage(gs.getMessage('All inactive catalog items have been removed from all shopping carts'));

})(current, previous);
