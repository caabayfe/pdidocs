(function() {
	var localInput = input; //to safeguard pullution of "input" via BR or other scripts

	var m = data.msgs = {};
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");
	m.cartEmptiedMsg = gs.getMessage("Your cart has been cleared");
	m.itemRemovedMsg = gs.getMessage("has been removed from your cart");
	m.updatedMsq = gs.getMessage("Updated");
	m.quantityToMsg = gs.getMessage("quantity to");
	m.removeItemConfirmationMsg = gs.getMessage("Are you sure you want to remove this item?");
	m.clearCartConfirmationMsg = gs.getMessage("Are you sure you want to empty your cart?");
	m.removeEditingItemMsg = gs.getMessage("Are you sure you want to remove the item you are viewing from your Cart?");
	var userID = gs.getUser().getID();
	var cartName = localInput && localInput.cartName ? localInput.cartName : '';
	var cartJS = new sn_sc.CartJS(cartName, '' + userID);
	var cartItemGr = cartJS.getCartItems();
	var engagementChannelOptions = {  //extracting here to safeguard pollution of 'options' via other scripts
		native_mobile : options.native_mobile
	};
	data.isMEE = options.native_mobile == 'true';
	data.engagement_channel = new global.GlobalServiceCatalogUtil().getEngagementChannel(engagementChannelOptions);
	data.numberOfCartItems = cartItemGr.getRowCount();
	data.sys_id = $sp.getParameter('sys_id');
	data.user_id = userID;
	if (localInput && localInput.action === "checkout_two") {
		if (!isCartValid(cartJS))
			return;

		data.checkoutCartModal = getCartCheckoutModal(localInput);
		return;
	} else if (localInput && localInput.action === 'checkout') {
		cartJS.setEngagementChannel(data.engagement_channel);
		checkoutCart(cartJS, cartItemGr);
		return;
	}

	if(!localInput){
		var clGenerator = new GlideChoiceList();
		var choiceListQuantity = clGenerator.getChoiceList("sc_cart_item", "quantity");
		var choicelistQuantityData = [];
		for (var i = 0; i < choiceListQuantity.size(); i++) {
			var choice = choiceListQuantity.get(i);
			if (!isNaN(choice.getValue()))
            choicelistQuantityData.push({
                value: parseInt(choice.getValue()),
                label: choice.getLabel()
            });
		}
		data.choiceListQuantity = choicelistQuantityData;
	}

	if (localInput && localInput.action === "update_quantity") {
		var cartItemGR = new GlideRecord("sc_cart_item");
		if (cartItemGR.get(localInput.itemID) && cartItemGR.canRead()) {
			cartItemGR.setValue("quantity", localInput.quantity);
			cartItemGR.update();
		}
	}

	if (localInput && localInput.action === "remove_item") {
		cartJS.remove(localInput.removeItemID);
	}

	if (localInput && localInput.action === "clear_cart") {
		cartJS.empty(cartJS.getCartID());
	}

	if (localInput && localInput.action === "save_cart") {
		var newCart = new SPCart(localInput.newCartName, userID);
		newCart.setHidden(false);
		newCart.loadCart(cart.getCartID());
	}

	data.sys_properties = {
        twostep: gs.getProperty("glide.sc.sp.twostep", "true") == 'true'  && !cartJS.checkAllItemsHaveRequestedFor(),
				mobileNativeColor: gs.getProperty("glide.sc.mobile.primary_color", "#1f8476"),
				isPolaris: gs.getProperty("glide.ui.polaris.experience", "false")
	};
	data.cart = cartJS.getCartDetails(true);
	data.cartItems = [];
	data.cart.recurring_subtotals = {};
	for(var key in data.cart.cart_items)
		if(data.cart.cart_items[key] && typeof data.cart.cart_items[key] === 'object') {
			var itemsByFrequency = data.cart.cart_items[key].items;
			data.cartItems = data.cartItems.concat(itemsByFrequency);
			if(key != 'none') {
				var show_recurring_price = false;
				for(var i=0; i<itemsByFrequency.length; i++) {
					if (itemsByFrequency[i].show_recurring_price)
						show_recurring_price = true;
				}
				if (show_recurring_price)
					data.cart.recurring_subtotals[data.cart.cart_items[key].frequency_label] = data.cart.cart_items[key].subtotal_recurring_price;
			}
		}
	data.cartItems = data.cartItems.map(function (item) {
        if (item.can_order)
            item.item_url = "?id=sc_cat_item&sys_id=" + item.sys_id + "&edit=cart";

		return item;
	})
	data.disable_req_for = sn_sc.CartJS.canViewRF();

    data.saveCartModal = $sp.getWidget('widget-modal', {
        embeddedWidgetId: 'sc_save_bundle',
        embeddedWidgetOptions: {},
		modalLabelledby : 'bundle-modal-title'
    });
	m.cartOpenedMsg = gs.getMessage("Your Cart opened with {0} items", JSON.stringify(data.cartItems.length));
})();

function checkoutCart(cart, cartItemGr) {
	try {
			var requestedCatItems = new global.GlobalServiceCatalogUtil().findCatItemsForSpLogs(cartItemGr);
			var request = cart.checkoutCart(true);
			data.result = {
				number: request.request_number,
				sys_id: request.request_id,
				table: 'sc_request',
				universal_request: request.universal_request
			};
			var portalId = $sp.getPortalRecord().getUniqueValue();
			$sp.logStat('Checkout Request', 'sc_request', request.request_id, request.request_number, portalId);
			new global.GlobalServiceCatalogUtil().logRequestedCatItems(requestedCatItems, portalId);
		} catch(e) {
			var catalogExceptionUtils = new CatalogExceptionUtils();
			if(catalogExceptionUtils.isCartException(e))
				gs.addErrorMessage(e.getMessage());
		}
}

function getCartCheckoutModal(localInput) {
	return $sp.getWidget('widget-modal', {
			embeddedWidgetId: 'sc-checkout',
			embeddedWidgetOptions: {
				cart: localInput.cart,
				auto_redirect: localInput.auto_redirect,
				native_mobile: options.native_mobile
			},
			backdrop: 'static',
			keyboard: false,
			size: 'md'
		});
}

function isCartValid(cart) {
	var isValid = cart.validateCartItems();
	if (isValid != "valid") {
		gs.addErrorMessage(isValid);
		return false;
	}
	return true;
}
