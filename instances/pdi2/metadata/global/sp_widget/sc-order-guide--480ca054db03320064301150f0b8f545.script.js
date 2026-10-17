(function() {
	var guideJS;
	data.isTwoStepEnabled = gs.getProperty('glide.sc.sp.twostep');
	//For cascading, initialising the below vairiables
	var variableClassToCascade = ["RequestedForQuestion"];
	var guideVariableNameMap = {};
	var guideVariableClassMap = {};
	var localInput = input; //to safeguard pullution of "input" via BR or other scripts
	var engagementChannelOptions = {  //extracting here to safeguard pollution of 'options' via other scripts
		native_mobile: options.native_mobile,
		isServiceWorkspace: options.isServiceWorkspace
	};

	data.sys_id = localInput.sys_id || options.sys_id || $sp.getParameter("sys_id");
	data.engagement_channel = new global.GlobalServiceCatalogUtil().getEngagementChannel(engagementChannelOptions);
	data.referrer = $sp.getParameter("referrer");

	if (localInput && localInput.action == "from_attachment")
		return;
	if (localInput && localInput.action == "get_requested_for") {
		data.requested_for = new global.GlobalServiceCatalogUtil().getRequestedFor(localInput.parentParams);
		return;
	}

	if (localInput && localInput.action == "get_parent_display_value") {
		var table = localInput.table;
		var sys_id = localInput.sys_id;
		var parentObject = {};
		var grParent = new GlideRecord(table);
		if (grParent.get(sys_id) && grParent.canRead()) {
			parentObject.parentDisplayValue = grParent.getDisplayValue();
			var tableLabel = grParent.getLabel();
			var formattedLabel = tableLabel.toLowerCase();
			parentObject.viewParentMsg = gs.getMessage("To view {0}, click {1}", [formattedLabel, "{link}"]);
		}
		data.parentObject = parentObject;
		return;
	}

	['auto_redirect', 'requested_for_id', 'requested_for_display'].forEach(function(embeddedWidgetOption) {
		if (localInput && typeof localInput[embeddedWidgetOption] != 'undefined')
			options[embeddedWidgetOption] = localInput[embeddedWidgetOption];
	});
	if (localInput && localInput.action == 'order_guide') {
		data.orderGuideModal = $sp.getWidget('widget-modal', {
			embeddedWidgetId: 'sc-checkout',
			embeddedWidgetOptions: {
				cart: {
					name: localInput.cart
				},
				action: localInput.action,
				item: localInput.itemDetails,
				requested_for: {
					id: options.requested_for_id,
					displayValue: options.requested_for_display
				},
				auto_redirect: options.auto_redirect,
				parentParams: localInput.workspaceParams,
				native_mobile: options.native_mobile,
				isServiceWorkspace: options.isServiceWorkspace,
				referrer: data.referrer,
				hide_actions: options.hide_actions,
				sc_request_page: options.sc_request_page || 'sc_request'
			},
			backdrop: 'static',
			keyboard: false,
			size: 'md'
		});
		return;
	} else if (localInput && localInput.action === 'log_request_cart') {
		$sp.logStat('Add to Cart Request', localInput.itemDetails.sys_class_name, localInput.itemDetails.sys_id, localInput.itemDetails.name, $sp.getPortalRecord().getUniqueValue());
		return;
	} else if (localInput && localInput.action == "init_guide") {
		data.choiceListQuantity = getQuantityChoiceList();
		guideJS = new sn_sc.OrderGuide('' + localInput.orderGuideData.sysparm_id);
		var temp = guideJS.init(localInput.orderGuideData);
		if (JSUtil.notNil(temp.errMsg)) {
			gs.addErrorMessage(temp.errMsg);
			data.error = true;
			return;
		}
		for (var gf in localInput.orderGuideData._fields) {
			var field = localInput.orderGuideData._fields[gf];
			if (variableClassToCascade.indexOf(field._class_name) > -1)
				guideVariableClassMap[field._class_name] = field;
			else
				guideVariableNameMap[field.name] = field;
		}
		//data.guide_requested_for will be needed to populate requested for field on cart_items of the included items.
		data.guide_requested_for = "";
		if (guideVariableClassMap.RequestedForQuestion)
			data.guide_requested_for = guideVariableClassMap.RequestedForQuestion.value;
		else {
			var defaultRequestedForValue = getDefaultRequestedForUser(localInput.orderGuideData, localInput.options);
			if (defaultRequestedForValue)
				guideVariableClassMap.RequestedForQuestion = {
					'value': defaultRequestedForValue,
					'displayValue': GlideUser.getUserByID(defaultRequestedForValue).getDisplayName()
				};
		}

		data.showIncludeToggle = guideJS.isIncludeItems();
		data.isSequencedGuide = guideJS.isSequencedGuide();
		data.requested_for_variable_count = 0;
		var item;
		var itemGlobalData = {
			items: [],
			client_scripts: {},
			ui_policies: {},
			ui_scripts: null
		};
		for (var i = 0; i < temp.items.length; i++) {
			var includedItem = new sn_sc.CatItem(temp.items[i].sys_id);
			if (!validateAccessForIncludedItem(includedItem, data.guide_requested_for))
				continue;
			var itemData = {
				'sys_id': temp.items[i].sys_id,
				'table': 'sc_cat_item',
				'quantity': temp.items[i].quantity,
				'is_guide': true,
				'order_guide_step': 'choose_options',
				'is_ordering': true,
				'variables': {}
			};
			if (localInput.orderGuideData.cascade) {
				for (var gf in localInput.orderGuideData._fields) {
					var field = localInput.orderGuideData._fields[gf];
					itemData.variables[field.name] = field.value;
				}
			}
			if (temp.variable_assignments[itemData.sys_id]) {
				var assignmentVariableValueMap = temp.variable_assignments[itemData.sys_id];
				for (var fieldId in assignmentVariableValueMap) {
					var q = GlideappQuestion.getQuestion(fieldId);
					itemData.variables[q.getName()] = assignmentVariableValueMap[fieldId];
				}
			}
			if (guideVariableClassMap.RequestedForQuestion)
				itemData.requested_for = guideVariableClassMap.RequestedForQuestion.value;

			item = $sp.getCatalogItem(itemData);
			item.quantity = temp.items[i].quantity;
			item.show_quantity = temp.items[i].show_quantity;
			item.isOrderGuideItem = true;
			item.included = true;
			item.delayView = true;
			item.sysparm_item_guid = gs.generateGUID();
			item._attachmentGUID = item.sysparm_item_guid;
			item.order = parseInt(temp.items[i].order);
			item.native_mobile = options.native_mobile == 'true';
			if (item.has_requested_for_variable)
				data.requested_for_variable_count++;

			transferDataIntoGloablObject(item, itemGlobalData);

			var table_name = 'sc_cart_item';
			var className = item.sys_class_name;
			if (!new global.CatalogItemTypeProcessor().canCreateNormalCartItem(className)) {
				if (className == 'sc_cat_item_producer') {
					var gr = new GlideRecord('sc_cat_item_producer');
					if (gr.get(item.sys_id))
						table_name = gr.getValue('table_name');
				}
			}
			item.targetTable = table_name;
			for (var field in item._fields) {
				var f = item._fields[field];
				if (f.sys_readonly)
					continue;

				if (guideVariableClassMap[f._class_name])
					copyField(guideVariableClassMap[f._class_name], f);
				else if (localInput.orderGuideData.cascade && guideVariableNameMap[f.name]) {
					copyField(guideVariableNameMap[f.name], f);
					if (f.type == 'sc_attachment')
						f.value = new VariableUtil().copyAttachment(guideVariableNameMap[f.name].value, 'ZZ_YY' + item.targetTable, item.sysparm_item_guid);
				}
				if (f._class_name === "RequestedForQuestion") {
					handleDelegationCheckOnField(includedItem, f);
					handleRequestedForReadOnlyOnField(data.guide_requested_for, f);
				}
			}
			if (temp.variable_assignments[item.sys_id]) {
				var cur = temp.variable_assignments[item.sys_id];
				for (var fieldId in cur) {
					var q = GlideappQuestion.getQuestion(fieldId);
					item._fields[q.getName()].value = cur[fieldId];
					if (q.getType() == 9 || q.getType() == 10) {
						q.setDisplayValue(cur[fieldId]);
					} else {
						q.setValue(cur[fieldId]);
						if (q.getType() == 21) {
							var vals = '' + q.getDisplayValues();
							vals = vals.slice(1, -1);
							item._fields[q.getName()].display_value_list = vals.split(', ');
						}
					}
					item._fields[q.getName()].displayValue = q.getDisplayValue();
				}
			}
			itemGlobalData.items.push(item);
		}
		data.itemGlobalData = itemGlobalData;
		if (temp.conflicting_cart_domain)
			data.conflictingCartDomainMsg = gs.getMessage("Your cart has item(s) belonging to '{0}' domain. To continue to add this item, clear the cart or check out the existing item(s).", temp.conflicting_cart_domain);
		return;
	} else if (localInput && localInput.action == "checkout_guide") {
		guideJS = new sn_sc.OrderGuide('' + data.sys_id);
		var cartJS = new sn_sc.CartJS('' + data.sys_id);
		if (localInput.requested_for.id)
			cartJS.setRequestedFor(localInput.requested_for.id);
		for (var i = 0; i < localInput.guideItems.length; i++) {
			if (localInput.guide_requested_for)
				localInput.guideItems[i].sysparm_guide_requested_for = localInput.guide_requested_for;
			try {
				guideJS.navigateFromMap(localInput.guideItems[i]);
			} catch (e) {
				//Should never Happen
			}
		}
		cartJS.activateGuide();
		cartJS.setParentParams(localInput.workspaceParams);
		cartJS.setEngagementChannel(data.engagement_channel);
		cartJS.setReferrer(data.referrer);
		data.result = cartJS.checkoutGuide();
		var portalId = $sp.getPortalRecord().getUniqueValue();
		$sp.logStat('Order Now Request', localInput.sc_cat_item.sys_class_name, localInput.sc_cat_item.sys_id, localInput.sc_cat_item.name, portalId);
		$sp.logStat('Cat Item Request', localInput.sc_cat_item.sys_class_name, localInput.sc_cat_item.sys_id, localInput.sc_cat_item.name, portalId);
		return;
	} else if (localInput && localInput.action == "add_to_cart") {
		var cart = new sn_sc.CartJS();
		guideJS = new sn_sc.OrderGuide('' + localInput.sys_id);
		for (var i = 0; i < localInput.items.length; i++) {
			if (localInput.guide_requested_for)
				localInput.items[i].sysparm_guide_requested_for = localInput.guide_requested_for;
			localInput.items[i].sysparm_cart_name = "";
			try {
				guideJS.navigateFromMap(localInput.items[i]);
			} catch (e) {
				//Should never happen
			}
		}
		if (guideJS.isUseCustomCart())
			new sn_sc.CartJS(localInput.sys_id).empty("");
		cart.activateGuide();
		return;
	} else if (localInput && localInput.action == "format_prices") {
		data.frequencySequence = [];
		var gr = new GlideRecord('sys_choice');
		gr.addQuery('name', 'sys_frequency');
		gr.addQuery('language', gs.getSession().getLanguage());
		gr.orderBy('sequence');
		gr.query();
		while (gr.next())
			data.frequencySequence.push(gr.label.getDisplayValue());
		var spCurrencyFormatter = new SPCurrencyFormatter();
		data.frequencyMap = {};
		for (var key in localInput.prices)
			data.frequencyMap[key] = spCurrencyFormatter.format(localInput.prices[key]);
		return;
	}
	// portal can specify a catalog and category home page
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	data.sc_category_page = $sp.getDisplayValue("sc_category_page") || "sc_category";
	var catalogID = $sp.getParameter("catalog_id") ? $sp.getParameter("catalog_id") + "" : "-1";
	var m = data.msgs = {};
	m.scHomeMsg = gs.getMessage("Service Catalog");
	m.step1 = gs.getMessage("Describe Needs");
	m.step2 = gs.getMessage("Choose Options");
	m.step3 = gs.getMessage("Summary");
	m.prevMsg = gs.getMessage("Previous");
	m.nextMsg = gs.getMessage("Next");
	m.submitMsg = gs.getMessage("Submit");
	m.orderNowMsg = gs.getMessage("Order Now");
	m.requestMsg = gs.getMessage("Request");
	m.submittedMsg = gs.getMessage("Submitted");
	m.createdMsg = gs.getMessage("Created");
	m.clickMsg = gs.getMessage("click here to view");
	m.dialogTitle = gs.getMessage("Delete Attachment");
	m.dialogMessage = gs.getMessage("Are you sure?");
	m.dialogOK = gs.getMessage("OK");
	m.dialogCancel = gs.getMessage("Cancel");
	m.requestSubmitted = gs.getMessage("Thank you, your request has been submitted.");
	m.viewAttachedImage = gs.getMessage("View attached image");
	m.downloadAttachment = gs.getMessage("Download attachment");
	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	m.alteastOneItemMsg = gs.getMessage("Include at least one catalog item");
	m.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "" + data.maxAttachmentSize + "MB");
	m.attachmentAddedMsg = gs.getMessage("Attachment added successfully");
	m.renameSuccessMsg = gs.getMessage("Attachment renamed successfully");
	m.deleteSuccessMsg = gs.getMessage("Attachment deleted successfully");
	m.invalidRecordMsg = gs.getMessage('You are either not authorized or record is not valid.');
	m.delete_attachment = gs.getMessage("Delete Attachment?");
	m.chooseOptionsOpenedMsg = gs.getMessage("Opened Choose options");
	m.orderSummaryOpenedMsg = gs.getMessage("Opened order guide summary");
	m.nextButtonEnabledMsg = gs.getMessage("Next button enabled");
	m.nextButtonDisabledMsg = gs.getMessage("Next button disabled");
	data.hideDeliveryTime = (options.hide_delivery_time == 'true');
	data.recordFound = true;

	if (options.sys_id)
		data.sys_id = options.sys_id;
	if (!data.sys_id) {
		data.recordFound = false;
		return;
	}
	var validatedItem = new sn_sc.CatItem('' + data.sys_id);
	if (!validatedItem.canView() || (!validatedItem.isVisibleServicePortal() && !inServiceWorkspace())) {
		data.recordFound = false;
		return;
	}
	if (options.native_mobile == 'true') {
		if (gs.getProperty('glide.sc.mobile.item_class_not_supported', '').split(',').indexOf(validatedItem.getRecordClass()) > -1) {
			data.not_for_mobile = true;
			return;
		}
		if (gs.getProperty('glide.sc.mobile.include_desktop_only_items', 'true') == 'false') {
			if (validatedItem.getAvailability() == 'on_desktop') {
				data.not_for_mobile = true;
				return;
			}
		}
	}

	data.showPrices = $sp.showCatalogPrices();
	data.sc_cat_item = $sp.getGuide(data.sys_id, true, false);
	data.favoriteWidget = $sp.getWidget('ec_favorite', {
		'table': data.sc_cat_item.sys_class_name,
		'sys_id': data.sys_id
	});
	data.readonly_user = gs.hasRole('snc_read_only');
	data.sc_cat_item.native_mobile = options.native_mobile == 'true';
	data.sys_properties = {
		twostep: gs.getProperty("glide.sc.sp.twostep", "true") == 'true',
		mobileNativeColor: gs.getProperty("glide.sc.mobile.primary_color", "#1f8476"),
		cartEnabled: gs.getProperty("glide.sc.cart.enabled", "false") == "true",
		isPolaris: gs.getProperty("glide.ui.polaris.experience", "false")
	};
	if (data.sc_cat_item.category) {
		var categoryJS;
		var categoryID = validatedItem.getFirstAccessibleCategoryForSearch((catalogID && catalogID != "-1" ? catalogID : $sp.getCatalogs().value + ""));
		if (GlideStringUtil.isEligibleSysID($sp.getParameter("sysparm_category"))) {
			categoryJS = new sn_sc.CatCategory($sp.getParameter("sysparm_category") + "");
			categoryID = $sp.getParameter("sysparm_category") + "";
		} else if (categoryID)
			categoryJS = new sn_sc.CatCategory(categoryID);
		if (categoryJS && GlideStringUtil.isEligibleSysID(categoryJS.getID())) {
			data.category = {
				name: categoryJS.getTitle(),
				url: '?id=' + data.sc_category_page + '&sys_id=' + categoryID
			}
			if (categoryJS.getCatalog()) {
				catalogID = categoryJS.getCatalog();
				data.catalog_id = catalogID;
				var catalogObj = new sn_sc.Catalog(catalogID);
				data.sc_catalog = catalogObj.getTitle();
			}
			data.categories = [];
			data.categories.push({
				label: categoryJS.getTitle(),
				url: '?id=' + data.sc_category_page + '&sys_id=' + categoryID
			});
			while (categoryJS && categoryJS.getParent()) {
				var parentId = categoryJS.getParent();
				categoryJS = new sn_sc.CatCategory(parentId);
				var category = {
					label: categoryJS.getTitle(),
					url: '?id=' + data.sc_category_page + '&sys_id=' + parentId
				};
				data.categories.unshift(category);
			}
			if ((($sp.getCatalogs().value + "").split(",")).length > 1) {
				data.all_catalog_msg = gs.getMessage("All Catalogs");
			}
		}
	}
	m.openedOrderGuideMsg = gs.getMessage("Order guide {0} opened", data.sc_cat_item.name);
	$sp.logStat('Cat Item View', data.sc_cat_item.sys_class_name, data.sc_cat_item.sys_id, data.sc_cat_item.name, $sp.getPortalRecord().getUniqueValue());
})();

function copyField(srcField, dstField) {
	dstField.value = srcField.value;
	dstField.displayValue = srcField.displayValue;
	if (dstField.type === 'glide_list')
		dstField.display_value_list = Array.isArray(srcField.display_value_list) ? srcField.display_value_list : [];
}

function transferDataIntoGloablObject(item, itemGlobalData) {
	if (item.client_script) {
		pullObjectsIntoGlobal(item.client_script.onLoad, itemGlobalData.client_scripts);
		pullObjectsIntoGlobal(item.client_script.onChange, itemGlobalData.client_scripts);
		pullObjectsIntoGlobal(item.client_script.onSubmit, itemGlobalData.client_scripts);
		item.client_script.onLoad = getIdArrFromObjectArray(item.client_script.onLoad);
		item.client_script.onChange = getIdArrFromObjectArray(item.client_script.onChange);
		item.client_script.onSubmit = getIdArrFromObjectArray(item.client_script.onSubmit);
	}
	pullObjectsIntoGlobal(item.policy, itemGlobalData.ui_policies);
	item.policy = getIdArrFromObjectArray(item.policy);
	if (!itemGlobalData.ui_scripts)
		itemGlobalData.ui_scripts = item.ui_scripts;

	item.ui_scripts = [];
}

function pullObjectsIntoGlobal(objectArr, globalObject) {
	for (var i in objectArr) {
		var id = objectArr[i].sys_id;
		if (!globalObject.hasOwnProperty(id))
			globalObject[id] = objectArr[i];
	}
}

function getIdArrFromObjectArray(objectArr) {
	var idArr = [];
	for (var i in objectArr)
		idArr.push(objectArr[i].sys_id)
	return idArr;
}

function getDefaultRequestedForUser(guideData, options) {
	var requestedForID = "";
	if (options.requested_for_id)
		requestedForID = options.requested_for_id;
	else if (guideData.sysparm_parent_table && guideData.sysparm_parent_sys_id)
		requestedForID = new global.GlobalServiceCatalogUtil().getRequestForSysID(guideData.sysparm_parent_table, guideData.sysparm_parent_sys_id);

	return requestedForID;
}

function handleRequestedForReadOnlyOnField(guideRequestedFor, field) {
	if (guideRequestedFor)
		field.sys_readonly = true;
}

function handleDelegationCheckOnField(item, field) {
	if (item.isDelegationAllowed(field.value))
		return;

	var delegationErrorMessage = {
		message: gs.getMessage("Item is unavailable for this user"),
		type: "error"
	};

	field.isServerInvalid = true;
	if (!field.messages)
		field.messages = [];

	field.messages.push(delegationErrorMessage)
}

function validateAccessForIncludedItem(includedItem, guideRequestedFor) {
	var isVisibleOnServicePortal = includedItem.isVisibleServicePortal() || inServiceWorkspace();
	var isAccessibleForRequester = includedItem.canView();
	var isDelegationAllowed = true;
	if (guideRequestedFor)
		isDelegationAllowed = includedItem.isDelegationAllowed(guideRequestedFor);

	return isVisibleOnServicePortal && isAccessibleForRequester && isDelegationAllowed;
}

function getQuantityChoiceList() {
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
	return choicelistQuantityData;
}

function isAttrTrue(value) {
	return value === true || value === 'true';
}
function inServiceWorkspace() {
		return isAttrTrue(options.isServiceWorkspace) && !isAttrTrue(options.legacy_catalog);
}
