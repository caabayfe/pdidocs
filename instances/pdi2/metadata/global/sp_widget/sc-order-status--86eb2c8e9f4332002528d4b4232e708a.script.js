(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */

	//Request sys_id can be passed as an option
	//By default URL parameter is used
	var request_id = $sp.getParameter('sys_id');

	if (options && options.hasOwnProperty('request_id_source') && (options.request_id_source === 'widget_options') && options.hasOwnProperty('request_id'))
		request_id = options.request_id;

	var user_language = gs.getUser().getLanguage();
	data.msg = {};
	data.msg.pageTitle = gs.getMessage('Request Status');
	data.is_new_order = (($sp.getParameter("is_new_order") + '') === "true");
	data.isMEE = options.native_mobile == 'true';
	data.msg.orderSubmitMsg = gs.getMessage('Thank You. Your request has been submitted');
	data.hide_actions = $sp.getParameter("hide_actions") == 'true';
	var engagementChannelOptions = {
		native_mobile : options.native_mobile,
		isServiceWorkspace : options.isServiceWorkspace
	};

	if (!request_id)
		return;

	if (input && input.action === 'clone_request') {
		data.progressModal = $sp.getWidget('widget-modal', {
			embeddedWidgetId: 'request_clone_progress',
			embeddedWidgetOptions: {
				sys_id: request_id,
				users: input.userList,
				engagement_channel: new global.GlobalServiceCatalogUtil().getEngagementChannel(engagementChannelOptions),
				referrer: $sp.getParameter("referrer")
			},
			backdrop: 'static',
			size: 'lg'
		});
		return;
	}

	var sc_request = GlideappRequestNew.get(request_id);
	if (!sc_request || !sc_request.getRequestNumber()) {
		if (options.isServiceWorkspace) {
			var gr = $sp.getRecord();
			if (gr == null)
				return;

			data.canRead = gr.canRead();
			if (!data.canRead)
				return;

			var table = $sp.getParameter('table');
			if (GlideTableDescriptor.isValid(table)) {
				data.tableName = GlideTableDescriptor.get(table).getLabel();
			}

			var currentRecordNumber = gr.getDisplayValue();
			data.currentRecord = {};
			data.currentRecord.number = currentRecordNumber;
			data.currentRecord.table = table;
			data.currentRecord.sys_id = gr.getUniqueValue();

			if (gr.isValidField('universal_request') && !gr.universal_request.nil()) {
				data.currentRecord.number = gr.universal_request.getDisplayValue();
				data.tableName = GlideTableDescriptor.get('universal_request').getLabel();
			}

		}
		return;
	}
	data.request = {};
	data.showPrices = $sp.showCatalogPrices();
	data.request.id = sc_request.getID();
	data.request.submitted_on = sc_request.getOpenedAt();
	data.request.number = sc_request.getRequestNumber();
	data.request.esimated_delivery = sc_request.getLongestDueDate();
	data.request.requested_for = sc_request.getRequestedFor();
	data.request.opened_by = sc_request.getOpenedBy();
	data.request.show_estimated_delivery = false;
	data.request.show_requested_for = sc_request.canShowRequestedFor();
	data.request.universal_request = sc_request.getUniversalRequestNumber();

	var isSequencedOG = false;
	if (GlideStringUtil.isEligibleSysID(sc_request.getOrderGuide())) {
		var orderGuide = new sn_sc.CatItem(sc_request.getOrderGuide() + '', "sc_cat_item_guide");
		isSequencedOG = GlideStringUtil.isEligibleSysID(orderGuide.getSequencingProcess()) ? true : false;
	}

	var pendingRP = getPendingRPList(isSequencedOG, data.request.id);
	var pendingRPCount = pendingRP.count;
	var pendingRPList = pendingRP.list.join(', ');
	if (pendingRPCount > 2) {
		var msgParms = [];
		msgParms.push(pendingRPList);
		msgParms.push(pendingRPCount - 2 + '');
		data.msg.pendingRPMsg = gs.getMessage("{0} and {1} other item(s) in the order guide will be created later based on the sequence ", msgParms);
	} else
		data.msg.pendingRPMsg = gs.getMessage("The items {0} in the order guide will be created later based on the sequence ", pendingRPList);

	data.request.pendingRPCount = pendingRPCount;
	if (options.isServiceWorkspace) {
			data.currentRecord = {};
			data.currentRecord.number = sc_request.getRequestNumber();
			data.currentRecord.table = 'sc_request';
			data.currentRecord.sys_id = sc_request.getID();
	}

	var reqItemGr = new GlideRecord('sc_req_item');
	reqItemGr.addQuery('request', request_id);
	reqItemGr.query();
	data.request.requestItems = [];
	var spCurrencyFormatter = new SPCurrencyFormatter();
	data.totalPrice = 0;
	data.frequencyMap = {};
	var gr = new GlideRecord('sys_choice');
	gr.addQuery('name', 'sys_frequency');
	gr.addQuery('language', user_language);
	gr.orderBy('sequence');
	gr.query();
	while(gr.next()) {
		data.frequencyMap[gr.value] = {
			display_value: gr.label.getDisplayValue(),
			value: 0,
			sequence: gr.getValue('sequence')
		};
	}
	var recurringPrice = {};
	while(reqItemGr.next()) {
		var catItem = new sn_sc.CatItem(reqItemGr.cat_item).getItemSummary(true);
		var frequency = reqItemGr.recurring_frequency.getValue();
		var frequency_dv  = reqItemGr.recurring_frequency.getDisplayValue();
		var itemTotalPrice = reqItemGr.price * reqItemGr.quantity.getValue();
		data.totalPrice += itemTotalPrice;
		var itemTotalRecurringPrice = reqItemGr.recurring_price * reqItemGr.quantity.getValue();
		data.totalRecurringPrice += itemTotalRecurringPrice;
		if (recurringPrice[frequency])
			recurringPrice[frequency] += itemTotalRecurringPrice;
		else
			recurringPrice[frequency] = itemTotalRecurringPrice;

		var showItemPrice = $sp.showPrice(itemTotalPrice);
		var showItemRecurringPrice = $sp.showRecurringPrice(itemTotalRecurringPrice, frequency_dv);

		if (catItem.show_delivery_time)
			data.request.show_estimated_delivery = true;

		var ritm = new SNC.RequestItem(reqItemGr);

		data.request.requestItems.push({
			sys_id: reqItemGr.sys_id.getValue(),
			name: catItem.name,
			delivery_date: ritm.getDeliveryDueDate(),
			stage: reqItemGr.stage.getValue(),
			number: reqItemGr.number.getValue(),
			quantity: reqItemGr.quantity.getValue(),
			show_quantity: catItem.show_quantity,
			show_delivery_time: catItem.show_delivery_time,
			price: parseFloat(reqItemGr.price.getValue()),
			price_dv: reqItemGr.price.getDisplayValue(),
			recurring_price: parseFloat(reqItemGr.recurring_price.getValue()),
			recurring_price_dv: reqItemGr.recurring_price.getDisplayValue() + ' ' + frequency_dv,
			requested_for: reqItemGr.getDisplayValue("requested_for"),
			requested_for_id: reqItemGr.getValue("requested_for"),
			showPrice: showItemPrice,
			showRecurringPrice: showItemRecurringPrice,
			total_price: itemTotalPrice,
			total_price_dv: spCurrencyFormatter.format(itemTotalPrice),
			total_reccuring_price: itemTotalRecurringPrice,
			total_reccuring_price_dv: spCurrencyFormatter.format(itemTotalRecurringPrice)  + ' ' + frequency_dv,
			stageWidget : $sp.getWidget("cb6631d39f2003002899d4b4232e7030", {req_item_id: reqItemGr.sys_id.getValue(), onload_expand_request_item_stages: false})
		});
	}
	var subTotalPrice = data.totalPrice + data.totalRecurringPrice;
	data.showSubTotalPrices = $sp.showPrice(subTotalPrice);
	data.totalPrice = spCurrencyFormatter.format(data.totalPrice);
	data.request.recurringPrice = [];
	for (var property in recurringPrice) {
    if (recurringPrice.hasOwnProperty(property) && data.frequencyMap[property]) {
			var val = recurringPrice[property];
			if (val > 0) {
				data.request.recurringPrice.push({
						sequence: parseInt(data.frequencyMap[property].sequence),
						val: spCurrencyFormatter.format(val),
						val_dv: data.frequencyMap[property].display_value
					});
      }
    }
	}
	data.request.recurringPrice.sort(function(a, b){return a.sequence - b.sequence;});
	var roles = gs.getProperty('glide.sc.allow.clone.roles', '');
	data.sys_properties = {
		canClone: roles == '' || gs.hasRole(roles)
	};

	$sp.logStat('Order Status View', 'sc_request', request_id, "", $sp.getPortalRecord().getUniqueValue());


	function getPendingRPList(isSequencedOG, requestID) {
		var pendingRP = {};
		var pendingRPCount = 0;
		var pendingRPList = [];
		if (!isSequencedOG) {
			pendingRP.count = pendingRPCount;
			pendingRP.list = pendingRPList;
			return pendingRP;
		}

		var cart = new GlideRecord("sc_cart");
		var cartName;
		var user;
		cart.addQuery("name", "ENDSWITH", requestID);
		cart.query();
		if (cart.next()) {
			cartName = cart.getValue("name");
			user = cart.getValue("user");
		}

		if (!cartName) {
			pendingRP.count = pendingRPCount;
			pendingRP.list = pendingRPList;
			return pendingRP;
		}
		var cartJS = new sn_sc.CartJS(cartName, user);
		var items = cartJS.getCartItems();
		while (items.next()) {
			pendingRPCount++;
			if (pendingRPCount > 2)
				continue;

			pendingRPList.push(items.cat_item.name);
		}
		pendingRP.count = pendingRPCount;
		pendingRP.list = pendingRPList;
		return pendingRP;
	}
})();
