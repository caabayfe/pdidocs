(function() {
	var localInput = input; //to safeguard pullution of "input" via BR or other scripts
	var engagementChannelOptions = {  //extracting here to safeguard pollution of 'options' via other scripts
		native_mobile : options.native_mobile,
		isServiceWorkspace : options.isServiceWorkspace
	};
	data.engagement_channel = new global.GlobalServiceCatalogUtil().getEngagementChannel(engagementChannelOptions);
	data.referrer = options.referrer;
	data.action = options.action;
	if (data.action)
		data.item = options.item;
	else
		data.action = 'checkout';

	if (localInput && localInput.action == "from_attachment")
		return;
	else if (localInput && localInput.action === 'log_request') {
		$sp.logStat('Order Now Request', localInput.itemDetails.sys_class_name, localInput.itemDetails.sys_id, localInput.itemDetails.name, $sp.getPortalRecord().getUniqueValue());
		$sp.logStat('Cat Item Request', localInput.itemDetails.sys_class_name, localInput.itemDetails.sys_id, localInput.itemDetails.name, $sp.getPortalRecord().getUniqueValue());
		return ;
	}

	var cartName = '';
	if (localInput)
		cartName = localInput.cart.name;
	else if (options.cart)
		cartName = options.cart.name;

	addInstrumentationData();

	var m = data.msgs = {};
	m.dialogTitle = gs.getMessage("Delete Attachment");
	m.dialogMessage = gs.getMessage("Are you sure?");
	m.dialogOK = gs.getMessage("OK");
	m.dialogCancel = gs.getMessage("Cancel");
	m.renameSuccessMsg = gs.getMessage("Attachment renamed successfully");
	m.deleteSuccessMsg = gs.getMessage("Attachment deleted successfully");
	m.delete_attachment = gs.getMessage("Delete Attachment?");
	m.requestSubmitted = gs.getMessage("Thank you, your request has been submitted.");
	m.checkingOutMsg = gs.getMessage("Submitting...");
	if (data.item.request_method == "request") {
		m.checkOutMsg = gs.getMessage("Request");
		m.checkoutPopupTitle = gs.getMessage("Request Confirmation");
	} else {
		m.checkOutMsg = gs.getMessage("Checkout");
		m.checkoutPopupTitle = gs.getMessage("Order Confirmation");
	}
	data.isMEE = options.native_mobile == 'true';
	data.sys_properties = {
		mobileNativeColor: gs.getProperty("glide.sc.mobile.primary_color", "#1f8476"),
		isPolaris: gs.getProperty("glide.ui.polaris.experience", "false")
	};

	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	m.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "" + data.maxAttachmentSize + "MB");

	var cartJS;
	if (data.action !== 'order_now') {
		cartJS = new sn_sc.CartJS(cartName, '' + gs.getUser().getID());

		if (localInput && localInput.action === "change_shipping_info") {
			cartJS.setSpecialInstructions(localInput.special_instructions);
			cartJS.setRequestedFor(localInput.requestedFor);
			cartJS.setDeliveryAddress(localInput.deliverTo);
		}
	}

	if (localInput && localInput.action == 'order_guide') {
		var guideJS = new sn_sc.OrderGuide('' + cartName);
		cartJS = new sn_sc.CartJS('' + cartName);
		for(var i = 0; i < localInput.item.items.length; i++) {
			guideJS.navigateFromMap(localInput.item.items[i]);
		}
		cartJS.activateGuide();
		cartJS.setRequestedFor(localInput.requested_for);
		cartJS.setDeliveryAddress(localInput.delivery_address);
		cartJS.setSpecialInstructions(localInput.special_instructions);
		cartJS.setParentParams(localInput.parentParams);
		cartJS.setEngagementChannel(localInput.engagement_channel);
		cartJS.setReferrer(localInput.referrer);
		var request = cartJS.checkoutGuide();
		data.result = {sys_id: request.request_id, number: request.request_number || request.number, table: request.table || 'sc_request'};
		var portalId = $sp.getPortalRecord().getUniqueValue();
		$sp.logStat('Order Now Request', localInput.item.sys_class_name, localInput.item.sys_id, localInput.item.name, portalId);
		$sp.logStat('Cat Item Request', localInput.item.sys_class_name, localInput.item.sys_id, localInput.item.name, portalId);
		return;
	}

	if (localInput && localInput.action === 'checkout') {
		cartJS.setEngagementChannel(localInput.engagement_channel);
		checkoutCart(cartJS);
		return;
	}

	if (data.action !== 'order_now')
		data.cart = cartJS.getCartDetails(false);
	else {
		var requested_for = {
			user_id : gs.getUser().getID(),
			user_name: gs.getUser().getDisplayName()
		};

		data.cart = {
			name: cartName,
			sys_id: gs.generateGUID(),
			requested_for: requested_for.user_id,
			requested_for_display_name: requested_for.user_name,
			delivery_address: sn_sc.CartJS.getRequestedForAddress(requested_for.user_id)
		};
	}

	if (options && options.parentParams) { //if parent is passed
			data.parentParams = options.parentParams;
	}
	if (options && options.requested_for && options.requested_for.id) { //If Passed via options
			data.cart.requested_for = options.requested_for.id;
			data.cart.requested_for_display_name = options.requested_for.displayValue;
			data.cart.delivery_address = sn_sc.CartJS.getRequestedForAddress(options.requested_for.id);
	}

	if (data.request_for) { //if value is changed by user
		var user = GlideUser.getUserByID(data.request_for);
		if (user.exists()) {
			data.cart.requested_for = data.request_for;
			data.cart.requested_for_display_name = user.getDisplayName();
			data.cart.delivery_address = sn_sc.CartJS.getRequestedForAddress(data.request_for);
		}
	}

	data.disable_req_for = sn_sc.CartJS.canViewRF();
	data.ignoreTableACL = gs.getProperty("glide.sc.sp.checkout.ignore.table.acl", "false") == "true";
	data.reqForDispColsFromProp = gs.getProperty("glide.sc.request_for.columns");
	data.refAcSearch = JSUtil.notNil(data.reqForDispColsFromProp) ? "true" : (GlideTableDescriptor.get("sys_user").getED().getAttribute("ref_ac_columns_search") == "true") + "";
	setRequestedForCols(data);
	data.reqForQuery = gs.getProperty("glide.sc.request_for.query");

})();

function setRequestedForCols(data) {
	var displayCol = GlideTableDescriptor.get("sys_user").getDisplayName();
	data.reqForDispCol = displayCol || "name";
	if (JSUtil.notNil(data.reqForDispColsFromProp)) {
		data.reqForDispCols = data.reqForDispColsFromProp;
		data.reqForDispCols = data.ignoreTableACL ?  data.reqForDispCols + ";" + data.reqForDispCol : data.reqForDispCols.replace(/;/g, ",");
		data.reqForDispCol = "name";
		data.reqForSearchCols = data.ignoreTableACL ? data.reqForDispCols : data.reqForDispCol + "," + data.reqForDispCols;
	}
	else {
		data.reqForSearchCols = data.reqForDispCol;
		var refAcCols = GlideTableDescriptor.get("sys_user").getED().getAttribute("ref_ac_columns");
		if(JSUtil.notNil(refAcCols))
			data.reqForDispCols = data.ignoreTableACL ? refAcCols + ";" +data.reqForDispCol : (refAcCols + "").replace(/;/g, ",");

		if(JSUtil.notNil(data.reqForDispCols) && JSUtil.notNil(data.refAcSearch) && data.refAcSearch == "true")
			data.reqForSearchCols += data.ignoreTableACL ? ";" + data.reqForDispCols : "," + data.reqForDispCols;
	}
}

function checkoutCart(cart) {
		try {
				var cartItemGr = cart.getCartItems();
				data.numberOfCartItems = cartItemGr.getRowCount();
				var requestedCatItems = new global.GlobalServiceCatalogUtil().findCatItemsForSpLogs(cartItemGr);
				var request = cart.checkoutCart(true);
				data.result = {
						sys_id: request.request_id,
						number: request.request_number,
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
				data.numberOfCartItems = 0;
		}
}

function addInstrumentationData() {
	if (input && input.action == 'change_shipping_info')
		return;

	if (data.action == 'order_now') {
		var catSysId = data.item.sys_id;
		var gr = new GlideRecord('sc_cat_item');
		if (gr.get(catSysId))
			data.item.title = gr.getValue('name');
	} else if (input && input.cart && data.action == 'checkout') {
			var cartData = [];
			var _data;
			var cartSysId = input.cart.sys_id;
			var grCart = new GlideRecord('sc_cart_item');
			grCart.query("cart", cartSysId);
			while(grCart.next()){
				_data = {};
				var gr2 = new GlideRecord('sc_cat_item');
				if (gr2.get(grCart.getValue("cat_item"))) {
					_data.sys_id = gr2.getValue('sys_id');
					_data.title = gr2.getValue('name');
					_data.cartID = cartSysId;
					cartData.push(_data);
				}
			}
		data.cartData = cartData;
	}
}
