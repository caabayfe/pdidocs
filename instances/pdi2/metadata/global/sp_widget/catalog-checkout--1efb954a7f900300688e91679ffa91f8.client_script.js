function($scope, $http, $timeout, $location, spScUtil, nowAttachmentHandler, spUtil, $log, spAriaUtil, $q, spAtf, spModal, spAriaFocusManager, cabrillo, snAnalytics) {
  var c = this;
  var sc_request_page = c.options.sc_request_page || 'sc_request';
	c.showSpecialInstructions = false;
	c.showDeliveryAddr = false;
	c.isNative = cabrillo.isNative() && c.data.isMEE;

	c.KEYS = {
		ESC : 27
	};

	c.onKeyDown = function(e) {
		if (e.keyCode == c.KEYS.ESC) {
		//There is a tooltip on this modal, which if opened should be closed first
		var ttElem = $('.tooltip.in');
      		if(!ttElem.length)
			c.cancel();
		}
	};

	if (c.data.ignoreTableACL)
		c.requestedFor = {
			ed: {
				reference: 'sys_user',
				searchField: c.data.reqForSearchCols,
				qualifier: c.data.reqForQuery
			},
			attributes: {
				ref_ac_columns: c.data.reqForDispCols,
				ref_auto_completer: "AJAXTableCompleter",
				ref_ac_columns_search: c.data.refAcSearch
			},
			displayValue: c.data.cart.requested_for_display_name,
			value: c.data.cart.requested_for,
			name: 'requested_for',
			isMandatory: function(){ return true;},
			g_form:{
				$private:{
					events:{
						on: function(){}
					}
				},
				setValue: function(name, value, displayValues) {
					if (c.requestedFor.value != value) {
						c.requestedFor.value = value;
						$scope.$emit("field.change", {field : {'name' : 'requested_for'}, newValue : value});
					}
				}
			}
		};


	c.updateDetails = function() {
		c.deliverTo = c.data.cart.delivery_address;
		c.special_instructions = c.data.cart.special_instructions;
		if (!c.data.ignoreTableACL) {
			c.requestedFor = {
				displayValue: c.data.cart.requested_for_display_name,
				value: c.data.cart.requested_for,
				name: 'requested_for'
			}
		} else
			c.requestedFor.value = c.data.cart.requested_for;
	}


	spAtf.init().then(function(atf) {
		$scope._atf = atf;
		atf.expose('checkout_util', checkoutUtil);
	});

	var checkoutUtil = {
		checkout: function() {
			var defer = $q.defer();
			$scope.c.triggerCheckout();
			var cleanUp;
			var isOrderGuide = c.data.action == 'order_guide';
			if(isOrderGuide)
				cleanUp = $scope.$on('$sp.sc_order_guide.submitted', function(o, result) {
					$timeout(function() {
						cleanUp();
						defer.resolve(result);
					}, 10);
				});
			else
				cleanUp = $scope.$on('$sp.sc_cat_item.submitted', function(o, result) {
					$timeout(function() {
						cleanUp();
						defer.resolve(result);
					}, 10);
				});
			return defer.promise;
		}
	}

	$scope.$on('dialog.upload_too_large.show', function(e){
		$log.error($scope.m.largeAttachmentMsg);
		spUtil.addErrorMessage($scope.m.largeAttachmentMsg);
	});

	$scope.m = $scope.data.msgs;
	$scope.checkOutMsg = $scope.m.checkOutMsg;
	$scope.checkoutPopupTitle = $scope.m.checkoutPopupTitle;

	displayNativeButtons();

	var ah = $scope.attachmentHandler = new nowAttachmentHandler(function (attachments, action) {
		$scope.attachments = attachments;
		if (action === "added")
			$scope.setFocusToAttachment();
		if (action === "renamed")
			spAriaUtil.sendLiveMessage($scope.m.renameSuccessMsg);
		if (action === "deleted")
			spAriaUtil.sendLiveMessage($scope.m.deleteSuccessMsg);
		spUtil.get($scope, {action: "from_attachment"});
	}, function (error) {
		spUtil.addErrorMessage(error.msg + error.fileName);
	});

	ah.setParams('sc_cart', c.data.cart.sys_id, 1024 * 1024 * $scope.data.maxAttachmentSize);

	$scope.attachmentHandler.getAttachmentList();

	$scope.confirmDeleteAttachment = function(attachment) {
		if (c.isNative) {
			if (confirm($scope.data.msgs.delete_attachment)) {
				$scope.attachmentHandler.deleteAttachment(attachment);
				$scope.setFocusToAttachmentButton();
			}
		} else {
			spModal.confirm($scope.data.msgs.delete_attachment).then(function() {
				$scope.attachmentHandler.deleteAttachment(attachment);
				$scope.setFocusToAttachmentButton();
			});
		}
	}

	c.changeShippingInfo = function() {
		if (c.data.action !== 'order_now')
			c.server.get({
						action: "change_shipping_info",
						requestedFor: c.requestedFor.value,
						special_instructions: c.special_instructions,
						deliverTo: c.deliverTo,
						cart: {name: c.data.cart.name}
					}).then(function(response) {
						c.data.cart = response.data.cart;
						c.updateDetails();
					});
	}

	c.triggerCheckout = function() {
		var newURL;
		c.checkoutInProgress = true;
		spAriaUtil.sendLiveMessage(c.data.msgs.checkingOutMsg, "status");

		putCheckingOutBtn();
		var webAnalyticsMsgSuffix = c.isNative ? " - NOW Mobile" : "";
		var additionalParms = {'sysparm_requested_for': c.requestedFor.value,
													 'special_instructions': c.special_instructions,
													 'delivery_address': c.deliverTo
													};
		if (c.data.parentParams) {
				additionalParms.sysparm_parent_sys_id =  c.data.parentParams.sysparm_parent_sys_id;
				additionalParms.sysparm_parent_table = c.data.parentParams.sysparm_parent_table;
				additionalParms.is_service_workspace = c.options.isServiceWorkspace;
		}
		additionalParms.engagement_channel = c.data.engagement_channel;
		additionalParms.referrer = c.data.referrer;
		additionalParms.sysparm_ai_referred_fields = c.options.sysparm_ai_referred_fields;
		if (c.data.action == 'order_now') {
			spScUtil.orderNow(c.data.item.sys_id, c.data.item.quantity, c.data.item.fields, c.data.item.newRecordID, additionalParms).then(function(response) {
				$scope.server.get({
					action: 'log_request',
					itemDetails: {
						sys_id: $scope.data.item.sys_id,
						name: $scope.data.item.name,
						sys_class_name: $scope.data.item.sys_class_name
					}
				});
				var a = response.data.result;
				if (c.options.isServiceWorkspace || !$scope.data.parentParams)
					$scope.$emit("$$uiNotification", a.$$uiNotification);
				$scope.$emit("$sp.sc_cat_item.submitted", a);
				// build and send payload for instrumentation
				var payload= {};
				payload.name = "Submit Catalog Request";
				payload.data = {};
				payload.data["Catalog Title"] = c.data.item.title;
				payload.data["Catalog SysID"] = c.data.item.sys_id;
				payload.data["Shopping Cart"] = "false";
				snAnalytics.addEvent(payload);

				if (c.options.auto_redirect == 'false') {
					$rootScope.$broadcast("$sp.service_catalog.cart.submitted", true);
					spUtil.addInfoMessage($scope.m.requestSubmitted);
					return;
				} else if (!$scope._atf) {
					//redirect to standrd ticket page if universal request is created
					if(a.universal_request && !c.options.native_mobile && !c.options.isServiceWorkspace)
						newURL = $location.search('id=standard_ticket&is_new_order=true&table=universal_request&sys_id=' + a.universal_request);
					else {
						var params = {
							id: sc_request_page,
							is_new_order: true,
							table: 'sc_request',
							sys_id: a.sys_id
						};
						if ($scope.data.referrer)
							params.referrer = $scope.data.referrer;
						if (c.options.isServiceWorkspace && c.options.hide_actions)
							params.hide_actions = c.options.hide_actions;

						newURL = $location.search(params);
					}
					spAriaFocusManager.navigateToLink(newURL.url());
				}
			}, function(response) {
				c.cancel();
				if (response.data.result && response.data.result.errMsg)
					spUtil.addErrorMessage(response.data.result.errMsg);
			});
		} else if (c.data.action == 'order_now_wishlisted_item') {
			spScUtil.orderWishlistedItem(c.data.item.sys_id, c.data.item.quantity, c.data.item.fields, c.data.item.newRecordID, additionalParms).then(function(response) {
				$scope.server.get({
					action: 'log_request',
					itemDetails: {
						sys_id: $scope.data.item.sys_id,
						name: $scope.data.item.name,
						sys_class_name: $scope.data.item.sys_class_name
					}
				});
				postOrderDraftOrWishlist(response, true);
			});
		}
		else if (c.data.action == 'order_now_draft_item') {
			spScUtil.orderDraftItem(c.data.item.sys_id, c.data.item.quantity, c.data.item.fields, c.data.item.newRecordID, additionalParms).then(function(response) {
				$scope.server.get({
					action: 'log_request',
					itemDetails: {
						sys_id: $scope.data.item.sys_id,
						name: $scope.data.item.name,
						sys_class_name: $scope.data.item.sys_class_name
					}
				});
				postOrderDraftOrWishlist(response, false);
			});
		}
		else {
			c.data.delivery_address = c.deliverTo;
			c.data.special_instructions = c.special_instructions;
			c.data.requested_for = c.requestedFor.value;
			var isOrderGuide = c.data.action == 'order_guide';
			c.server.update().then(function(response) {
				if (!response.result)
					return;

				// build and send payload for instrumentation
				var cartData = c.data.cartData;
				var cartDataLen = c.data.cartData.length;
				for (var i = 0; i < cartDataLen; i++) {
					var payload= {};
					payload.name = "Submit Catalog Request";
					payload.data = {};
					payload.data["Catalog Title"] = cartData[i].title;
					payload.data["Catalog SysID"] = cartData[i].sys_id;
					payload.data["Catalog Cart SysID"] = cartData[i].cartID;
					payload.data["Shopping Cart"] = "true";
					snAnalytics.addEvent(payload);
				}

				c.data.action = null;
				if (isOrderGuide) {
					window.GlideWebAnalytics.trackEvent("Service Catalog", "Order Guide Request" + webAnalyticsMsgSuffix, "Catalog Request Submitted", $scope.data.item.items.length, 0);
					$scope.$emit("$sp.sc_order_guide.submitted", $scope.data.result);
				}
				else {
					window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog Cart" + webAnalyticsMsgSuffix, "Catalog Request Submitted", c.data.numberOfCartItems, 0);
					$scope.$emit("$sp.cart.submitted", $scope.data.result);
				}
				if (c.options.auto_redirect == 'false') {
					$rootScope.$broadcast("$sp.service_catalog.cart.update");
					$rootScope.$broadcast("$sp.service_catalog.cart.submitted", true);
					spUtil.addInfoMessage($scope.m.requestSubmitted);
					return;
				}
				else {
					if ($scope.data.result.sys_id) {
						if($scope.data.result.universal_request)
							newURL = $location.search('id=standard_ticket&is_new_order=true&table=universal_request&sys_id=' + $scope.data.result.universal_request);
						else {
							var params = {
								id: sc_request_page,
								is_new_order: true,
								table: 'sc_request',
								sys_id: $scope.data.result.sys_id
							};
							if ($scope.data.referrer)
								params.referrer = $scope.data.referrer;

							if (c.options.isServiceWorkspace && c.options.hide_actions)
								params.hide_actions = c.options.hide_actions;

							newURL = $location.search(params);
						}
					}
					else
						newURL = $location.search('id=requests&is_new_order=true');

					removeCabrilloButtons();
					spAriaFocusManager.navigateToLink(newURL.url());

					$timeout(function(){
						$rootScope.$broadcast("$sp.service_catalog.cart.update", {checkedOut: true});
						$rootScope.$broadcast("$sp.service_catalog.cart.submitted", true);
					})

				}
			});
		}
	}

	$scope.$on("field.change", function(evt, parms) {
		if (parms.field.name == 'requested_for') {
			c.data.cart.requested_for = parms.newValue;
			var getShippingAddrURL = '/api/sn_sc/v1/servicecatalog/cart/delivery_address/' + parms.newValue;
			$http.get(getShippingAddrURL).then(function handleSuccess(response) {
				if (response.data.result) {
					c.deliverTo = response.data.result.trim();
				} else {
					c.deliverTo = '';
				}
				c.changeShippingInfo();
			});
		}
	});

	c.cancel = function() {
		if (c.isNative) {
			cabrillo.viewLayout.setTitle(c.oldTitle);
			removeCabrilloButtons();
		}
		$rootScope.$broadcast("$sp.service_catalog.cart.cancel_order", true);
	}

	c.allowDeliveryAddress = function () {
		if (c.data.item)
			return c.data.item.request_method != "request"
		return true;
	}

	var mespClosePopupUnregister = $rootScope.$on("mesp.popup.close", function() {
		// Timeout is to give a better user experience otherwise when this popup opens,
		// the cabrillo buttons will be displayed immediately giving a bad user experience.
		$timeout(function(){
			displayNativeButtons();
		});
	});

	var mespOpenPopupUnregister = $rootScope.$on("mesp.popup.open", function() {
		// Timeout is to give a better user experience otherwise when this popup opens,
		// the cabrillo buttons will be displayed immediately giving a bad user experience.
		$timeout(function(){
			removeCabrilloButtons();
		});
	});

	$scope.$on("$destroy", function() {
		mespClosePopupUnregister();
		mespOpenPopupUnregister();
	});

	function removeCabrilloButtons() {
		 if (c.isNative)
			 cabrillo.viewLayout.setBottomButtons();
	}

	function postOrderDraftOrWishlist(response, isWishlist) {
				var a = response.data.result;
				if (c.options.isServiceWorkspace || !$scope.data.parentParams)
					$scope.$emit("$$uiNotification", a.$$uiNotification);
				$scope.$emit("$sp.sc_cat_item.submitted", a);
				if (isWishlist)
					$rootScope.$broadcast("$sp.service_catalog.wishlist.update");

				if (c.options.auto_redirect == 'false') {
					$rootScope.$broadcast("$sp.service_catalog.cart.submitted", true);
					spUtil.addInfoMessage($scope.m.requestSubmitted);
					return;
				} else {
//redirect to standrd ticket page if universal request is created
					if(a.universal_request && !c.options.native_mobile && !c.options.isServiceWorkspace)
						newURL = $location.search('id=standard_ticket&is_new_order=true&table=universal_request&sys_id=' + a.universal_request);
					else {
						var params = {
							id: sc_request_page,
							is_new_order: true,
							table: 'sc_request',
							sys_id: a.sys_id
						};
						if ($scope.data.referrer)
							params.referrer = $scope.data.referrer;

						newURL = $location.search(params);
					}
					spAriaFocusManager.navigateToLink(newURL.url());
				}
	}

	function displayNativeButtons() {
			if (c.isNative) {
					if (typeof cabrillo.viewLayout.getTitle == 'function') {
						cabrillo.viewLayout.getTitle().then(function(title) {
							c.oldTitle = title;
							cabrillo.viewLayout.setTitle($scope.checkoutPopupTitle);
						});
					}
					var buttons = [
						{
							title: $scope.m.dialogCancel,
							enabled: true,
							backgroundColor: '#f7f7f7',
							textColor: '#000000'
						},
						{
							title: $scope.checkOutMsg,
							enabled: true,
							backgroundColor:  $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
							textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
						}
					];
					cabrillo.viewLayout.hideBackButton();
					cabrillo.viewLayout.setNavigationBarButtons();
					cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
						if (buttonIndex == 0) {
							c.cancel();
						}
						else {
							c.triggerCheckout();
						}
					});
				}
	}

	function putCheckingOutBtn() {
			if (c.isNative) {
					var buttons = [
										{
												title: $scope.m.dialogCancel,
												enabled: false,
											  backgroundColor: '#f7f7f7',
												textColor: '#000000'
										},
										{
												title: $scope.m.checkingOutMsg,
												enabled: false,
												backgroundColor:  $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
												textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
										}
								];

			  cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {});
			}
	}

	c.updateDetails();
}
