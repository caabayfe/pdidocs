function ($scope, spUtil, $location, $timeout, spModal, spAriaUtil, $http, cabrillo, i18n) {
	var c = this;
	c.m = $scope.data.msgs;
	c.isNative = cabrillo.isNative() && c.data.isMEE;
	var webAnalyticsMsgSuffix = c.isNative ? " - NOW Mobile" : "";
	if (c.isNative) {
		cabrillo.viewLayout.setTitle(i18n.getMessage('Your Cart'));
		addCheckoutNativeButtons();
	}

	function setNativeNavigationBarButton() {
		if(!c.isNative) return;

		cabrillo.viewLayout.setTitle(i18n.getMessage('Your Cart'));
		var button = [{
					title: i18n.getMessage('Done'),
					enabled: true
			}];
			cabrillo.viewLayout.hideBackButton();
			cabrillo.viewLayout.setNavigationBarButtons();
			cabrillo.viewLayout.setNavigationBarButtons(button, function(index) {
					cabrillo.flowControl.flowEnded();
			});
	}

	function resetCartNativeButtons() {
		if (!c.data.cartItems.length && c.isNative) {
			cabrillo.viewLayout.setBottomButtons();
			cabrillo.viewLayout.setNavigationBarButtons()
			cabrillo.viewLayout.hideBackButton();
			var button = [{
            imageName: 'back',
            buttonStyle: cabrillo.viewLayout.REPLACE_BACK_BUTTON_STYLE,
            enabled: true
        }];
			cabrillo.viewLayout.setNavigationBarButtons(button, function() {
            cabrillo.flowControl.flowEnded();
        });
		}
	}

	function removeCabrilloButtons() {
			if (c.isNative)
				cabrillo.viewLayout.setBottomButtons();
	}

	function addCheckoutNativeButtons() {
		if (!c.data.cartItems.length || !c.isNative) return;
		cabrillo.viewLayout.setBottomButtons();
		setNativeNavigationBarButton();

		var buttonTitle, buttonEnabled;
		if (!c.checkoutInProgress) {
			buttonTitle = c.data.sys_properties.twostep ?
				i18n.getMessage('Proceed to Checkout'):
				i18n.getMessage('Checkout');
			buttonEnabled = true;
		} else {
			buttonTitle = i18n.getMessage('Ordering...');
			buttonEnabled = false;
		}
		var buttons = [
			{
				title: buttonTitle,
				enabled: buttonEnabled,
				backgroundColor: $scope.data.sys_properties.isPolaris == "true" ? null : $scope.data.sys_properties.mobileNativeColor,
				textColor: $scope.data.sys_properties.isPolaris == "true" ? null : '#FFFFFF'
			}
		];
		cabrillo.viewLayout.setBottomButtons(buttons, function(buttonIndex) {
			c.triggerCheckout();
		});
	}

	var mespClosePopupUnregister = $rootScope.$on("mesp.popup.close", function() {
		// Timeout is to give a better user experience otherwise when this popup opens,
		// the cabrillo buttons will be displayed immediately giving a bad user experience.
		$timeout(function(){
			setNativeNavigationBarButton();
			addCheckoutNativeButtons();
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

	$scope.$on("$sp.service_catalog.cart.update", function(evt, payload) {
			if (payload && payload.checkedOut) {
				// To avoid a flash of empty cart, checkout should be sent as true from the flow where checkout is happening from large cart with a redirect.
				// 1. Two step checkout with redirect
				// 2. Direct checkout from large shopping cart
				c.data.checkedOut = payload.checkedOut;
			}
			$scope.server.update().then(function() {
				$scope.$emit("$sp.service_catalog.cart.count", getItemCount());
			});
	});

	c.updateQuantity = function(item) {
		spAriaUtil.sendLiveMessage(c.data.msgs.updatedMsq + " " + item.name + " " + c.data.msgs.quantityToMsg + " " + item.quantity);

		c.server.get({
			action: "update_quantity",
			itemID: item.sys_id,
			quantity: item.quantity
		}).then(function(response) {
			window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog Cart" + webAnalyticsMsgSuffix, "Quantity Changed", 0, 0);
			$rootScope.$broadcast("$sp.service_catalog.cart.update");
		});

		setNativeNavigationBarButton();
	}

	c.checkoutTwo = function() {
		var hasItems = c.data.cartItems.filter(function(item) {
			return item.sys_class_name != 'sc_cat_item_producer';
		}).length > 0;
		if (hasItems) {
			c.server.get({
				cart: c.data.cart,
				auto_redirect: c.options.auto_redirect || 'true',
				action: "checkout_two"
			}).then(function(response) {
				var checkoutCartModalCtrl;
				var unregisterOnCancel = $scope.$on('$sp.service_catalog.cart.cancel_order', function() {
					checkoutCartModalCtrl.close();
					if (c.isNative) {
						cabrillo.viewLayout.setTitle(i18n.getMessage('Your Cart'));
						addCheckoutNativeButtons();
					}
				});
				var unregisterOnSubmit = $scope.$on('$sp.service_catalog.cart.submitted', function() {
					checkoutCartModalCtrl.close();
				});

				var checkoutCartModal = angular.copy(response.data.checkoutCartModal);
				checkoutCartModal.options.afterOpen = function(ctrl){
					checkoutCartModalCtrl = ctrl;
				};
				checkoutCartModal.options.afterClose = function() {
					unregisterOnCancel();
					unregisterOnSubmit();
					c.checkoutCartModal = null;
					checkoutCartModalCtrl = null;
				};
				c.checkoutCartModal = checkoutCartModal;
			});
		} else {
			c.server.get({
				action: "checkout"
			}).then(function(response) {
				if (!response.data.result) {
					return;
				}
				var redirectUrl = 'id=sc_home';
				if (response.data.result.sys_id)
					redirectUrl = "id=ticket&is_new_order=true&table=" + response.data.result.table + "&sys_id=" + response.data.result.sys_id;

				if (c.isNative)
					cabrillo.flowControl.flowEnded();
				else
					$location.search(redirectUrl);

				$rootScope.$broadcast("$sp.service_catalog.cart.update");
				$rootScope.$broadcast("$sp.service_catalog.cart.submitted", true);
			});
		}
	}

	c.triggerCheckout = function() {
		if (c.data.sys_properties.twostep) {
			c.checkoutTwo();
			return;
		}
		c.checkoutInProgress = true;
		c.data.action = 'checkout';
		if (c.isNative) {
			addCheckoutNativeButtons();
		}
		c.server.update().then(function(response) {
			c.data.action = null;
			c.checkoutInProgress = false;
			if (!response.result)
				return;
			var result = $scope.data.result;
			if (c.isNative) {
				cabrillo.viewLayout.setBottomButtons();
			}
			window.GlideWebAnalytics.trackEvent('Service Catalog', 'Catalog Cart' + webAnalyticsMsgSuffix, 'Catalog Request Submitted', c.data.numberOfCartItems, 0);
			handleRedirect(result.number, result.table, result.sys_id,result.universal_request);
			$rootScope.$broadcast("$sp.service_catalog.cart.update", {checkedOut: true});
			$rootScope.$broadcast("$sp.service_catalog.cart.submitted", true);
		});
	}

	c.removeItem = function(e, item) {
		var target = e.currentTarget;
		var removeButtons = $('#cart').find(".btn.btn-clear");
		var currentIndex = removeButtons.index(target);
		var urlId = $location.url().split('sys_id=')[1];
		if(urlId)
			urlId = urlId.split('&')[0];
		var dialogMsg = urlId === item.sys_id ? c.data.msgs.removeEditingItemMsg : c.data.msgs.removeItemConfirmationMsg;
		if (c.isNative) {
			if (confirm(dialogMsg)) {
				$scope.server.get({
					cartName: "DEFAULT",
					action: "remove_item",
					removeItemID: item.sys_id
				}).then(function(response) {
					handleRemoveItem(response, item, removeButtons, currentIndex);
					resetCartNativeButtons();
					cabrillo.message.showMessage(cabrillo.message.SUCCESS_MESSAGE_STYLE, i18n.getMessage('Cart updated'));
				});
			}
		} else {
			spModal.confirm(dialogMsg).then(function(confirmed) {
				if (confirmed) {
					$scope.server.get({
						cartName: "DEFAULT",
						action: "remove_item",
						removeItemID: item.sys_id
					}).then(function(response) {
						handleRemoveItem(response, item, removeButtons, currentIndex);
						window.GlideWebAnalytics.trackEvent('Service Catalog', 'Catalog Cart' + webAnalyticsMsgSuffix, 'Item Removed', 0, 0);
						if (urlId === item.sys_id)
							$location.search('id=sc_cart');
					});
				}
			});
		}
	}

	function handleRemoveItem(response, item, removeButtons, currentIndex) {
		c.data.cart = response.data.cart;
		c.data.cartItems = response.data.cartItems;
		$rootScope.$broadcast("$sp.service_catalog.cart.update");
		if (response.data.cartItems.length == 0) {
			$scope.setFocusEmptyCartHeading(item.name + " " + c.data.msgs.itemRemovedMsg);
			spUtil.addTrivialMessage(c.data.msgs.cartEmptiedMsg);
		} else {
			if (currentIndex != -1) {
				var nextFocusIndex = (currentIndex == removeButtons.size()-1) ? currentIndex - 1: currentIndex +1;
				removeButtons.eq(nextFocusIndex).focus().after(function() {
					$scope.sendLiveMessage(item.name + " " + c.data.msgs.itemRemovedMsg, 500);
				});
			} else {
				$scope.sendLiveMessage(item.name + " " + c.data.msgs.itemRemovedMsg, 500);
			}
		}
	}

	c.clearCart = function() {
		if (c.isNative) {
			if (confirm(c.data.msgs.clearCartConfirmationMsg)) {
				c.server.get({
					action: "clear_cart"
				}).then(function(response) {
					c.data.cart = response.data.cart;
					c.data.cartItems = response.data.cartItems
					resetCartNativeButtons();
					$rootScope.$broadcast("$sp.service_catalog.cart.update");
					spUtil.addTrivialMessage(c.data.msgs.cartEmptiedMsg);
					scope.setFocusEmptyCartHeading(c.data.msgs.cartEmptiedMsg);
				});
			}
		} else {
			spModal.confirm(c.data.msgs.clearCartConfirmationMsg).then(function(confirmed) {
				if (confirmed) {
					c.server.get({
						action: "clear_cart"
					}).then(function(response) {
						c.data.cart = response.data.cart;
						c.data.cartItems = response.data.cartItems
						$rootScope.$broadcast("$sp.service_catalog.cart.update");
						window.GlideWebAnalytics.trackEvent('Service Catalog', 'Catalog Cart' + webAnalyticsMsgSuffix, 'Cart Cleared', 0, 0);
						spUtil.addTrivialMessage(c.data.msgs.cartEmptiedMsg);
						$scope.setFocusEmptyCartHeading(c.data.msgs.cartEmptiedMsg);
					});
				}
			});
		}
	}

	c.saveBundle = function() {
		var saveCartModalCtrl;
		var unregister = $scope.$on('$sp.service_catalog.cart.save_cart', function(){
			saveCartModalCtrl.close();
		});

		var saveCartModal = angular.copy(c.data.saveCartModal);
		saveCartModal.options.afterOpen = function(ctrl){
			saveCartModalCtrl = ctrl;
		};
		saveCartModal.options.afterClose = function() {
			unregister();
			c.saveCartModal = null;
			saveCartModalCtrl = null;
		};
		c.saveCartModal = saveCartModal;
	}

	c.showPrice = function(item) {
		return item.show_price && item.sys_class_name != 'sc_cat_item_producer';
	}

	c.showQuantity = function(item) {
		// Following if block is code for hard-setting an aria-label on the quantity select box
		// for displaying the label "quantity"
		var id = item.sys_id;
		var quantityElements = [];
		var label = i18n.format("Quantity for {i1} is {i2}", {i1: item.name, i2: item.quantity});
		quantityElements.push($('#' + id));
		quantityElements.push($('#' + id + 'xs'));
		for (var i = 0; i < quantityElements.length; i++) {
			if (quantityElements[i] != null) {
				var quantityInputElement = quantityElements[i].prev().find(".select2-focusser.select2-offscreen");
				quantityInputElement.removeAttr("aria-labelledby").attr("aria-label",label);
				quantityInputElement.attr("aria-expanded", false)
			}
		}

		return item.show_quantity && item.sys_class_name != 'sc_cat_item_producer';
	}

	c.getQuantityTitle = function(item) {
		return ((item.order_guide && !item.show_quantity_guide_item) || !item.can_order) ? i18n.format("Quantity for {i1} is {i2} and cannot be changed.",{i1: item.name, i2: item.quantity}): "";
	}

	c.showRecurringPrice = function(item) {
		return item.show_recurring_price && item.sys_class_name != 'sc_cat_item_producer';
	}

	c.KEYS = {
		DOWN:40,
		UP:38
	};

	c.onKeyDown = function(e) {
		var target = e.currentTarget;
		var selectables = $('#small-cart').children().find("a:visible, button:visible");
		var index = selectables.index(target);
		if(e.keyCode == c.KEYS.UP) {
			e.preventDefault();
			e.stopPropagation();
			selectables.eq(index - 1).focus();
		} else if(e.keyCode == c.KEYS.DOWN) {
			e.preventDefault();
			e.stopPropagation();
			if (index == selectables.size() - 1) index = -1;
			selectables.eq(index + 1).focus();
		}
	};


	c.redirectToCatalogHome = function() {
	   $location.search('id=sc_home')
	}

	c.redirectToCart = function() {
		 $location.search('id=sc_cart')
	}

	function handleRedirect(n, table, sys_id, ur_id) {
		if(ur_id)
			$location.search('id=standard_ticket&is_new_order=true&table=universal_request&sys_id=' + ur_id);
		else
		$location.search('id=sc_request&is_new_order=true&table=sc_request&sys_id=' + sys_id);
	}

	$scope.$emit("$sp.service_catalog.cart.count", getItemCount());

	function getItemCount() {
		return c.data.cartItems.length || 0;
	}

	function isOperationAlreadyPerformed(data) {
		if (data.operation == 'delete')
			return !isItemPresent(data);

		else if (data.operation == 'insert')
			return isItemPresent(data);

		else if (data.operation == 'update')
			return isItemUpdated(data);

		return false;
	}

	function isItemPresent(data) {
		for (var index in c.data.cartItems)
			if (data.sys_id == c.data.cartItems[index].sys_id)
				return true;

		return false;
	}

	function isItemUpdated(data) {
		for (var itemIndex in c.data.cartItems) {
			if (data.sys_id == c.data.cartItems[itemIndex].sys_id) {
				var cartItem = c.data.cartItems[itemIndex];
				for (var index in data.changes) {
					var prop = data.changes[index];
					if (data.record[prop].value != cartItem[prop])
						return false;
				}
				return true;
			}
		}
		return false;
	}

	if(c.options.auto_update_cart === true || c.options.auto_update_cart === "true") {
		spUtil.recordWatch($scope, 'sc_cart_item', 'cart.name=DEFAULT^cart.user=' + $scope.data.user_id, function(resp) {
				if (resp && resp.data && resp.data.operation == "insert")
					$scope.$emit("$sp.service_catalog.cart.add_item");
				if (!isOperationAlreadyPerformed(resp.data))
					$scope.$emit("$sp.service_catalog.cart.update");
		});
		$scope.$watch("c.data.cartItems", function() {
			$scope.$emit("$sp.service_catalog.cart.count", getItemCount());
		});
	}
	spAriaUtil.sendLiveMessage(c.data.msgs.cartOpenedMsg);

	$scope.sendLiveMessage = function(message, timeout) {
		if (!message)
			return;

		if (!timeout)
			timeout = 0;

		$timeout(function() {
			spAriaUtil.sendLiveMessage(message);
		}, timeout);
	}
}
