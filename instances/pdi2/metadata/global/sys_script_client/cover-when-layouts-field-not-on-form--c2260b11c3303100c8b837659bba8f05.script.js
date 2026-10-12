function onLoad() {
	var useLayouts = g_scratchpad.use_cart_layouts + '' == 'true';
    var itemUseLayouts = g_scratchpad.item_use_cart_layouts + '' == 'true';
   showFields(!useLayouts || !itemUseLayouts);
}

function showFields(show) {
	var fields = ['no_cart', 'no_order_now', 'no_quantity', 'no_order', 'no_proceed_checkout', 'omit_price'];
	for (var i = 0; i < fields.length; i++)
		g_form.setVisible(fields[i], show);
}
