function(spAriaUtil, $rootScope, $scope) {
  /* widget controller */
  var c = this;

	c.saveCart = function() {
		c.data.error = null;
		window.GlideWebAnalytics.trackEvent("Service Catalog", "Catalog Cart", "Bundle Saved");
		c.server.update().then(function() {
			if (!c.data.error) {
				$rootScope.$broadcast("$sp.service_catalog.cart.save_cart");
				spAriaUtil.sendLiveMessage(c.data.bundleSaveSuccessMsg);
				$rootScope.hasSavedCarts = true;
			} else {
				$('#bundlename').focus();
			}
		});
	}

	c.enableSave = function() {
		return c.data.newCartName &&
			c.data.newCartName.length > 0 &&
			c.data.cartItems.filter(function(item){
				return item.selected;
			}).length > 0;
	}

	c.clearFocusListCache = function() {
		$scope.$emit('sp.widget-modal.clear-focus-cache');
	}
	
	c.validate = function() {
		if (!c.data.newCartName) {
			c.data.error = '';
		}
		c.server.get({
				'cart_name': c.data.newCartName,
				'action': 'validate_cart_name'
			}).then(function(response) {
				c.data.error = response.data.error;
		})
	}
}
