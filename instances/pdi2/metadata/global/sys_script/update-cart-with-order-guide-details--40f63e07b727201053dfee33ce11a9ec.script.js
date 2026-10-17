(function executeRule(current, previous /*null when async*/) {

	if (current.active == '0' || current.operation() == 'delete')
		clearOrderGuide(current.order_guide, current.cart);

	else if (current.operation() == 'insert' || current.operation() == 'update') {
		var cartGR = new GlideRecord('sc_cart');
		if (cartGR.get(current.cart)) {
			var guidesAdded = cartGR.guides_added;

			if (gs.nil(guidesAdded))
				guidesAdded = current.order_guide;

			if (guidesAdded.indexOf(current.order_guide) == -1)
				guidesAdded += ',' + current.order_guide;

			cartGR.setValue('guides_added', guidesAdded);
			cartGR.setWorkflow(false);
			cartGR.update();
		}
	}

})(current, previous);

function clearOrderGuide(og, cartId) {
	var ciGR = new GlideRecord('sc_cart_item');
	ciGR.addActiveQuery();
	ciGR.addQuery('order_guide', og);
	ciGR.addQuery('cart', cartId);
	ciGR.query();

	if (ciGR.getRowCount() == 0) {

		var cartGr = new GlideRecord('sc_cart');
		if (cartGr.get(cartId)) {
			var guidesAdded = cartGr.guides_added;

			if (!gs.nil(guidesAdded) && guidesAdded.indexOf(og) != -1) {
				var guidesArr = guidesAdded.split(',').filter(function(e) {
					return e != og;
				});

				cartGr.setValue('guides_added', guidesArr.join(','));
			    cartGr.setWorkflow(false);
				cartGr.update();
			}
		}
	}
}
