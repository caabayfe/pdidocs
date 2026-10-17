function (scope, element) {
	scope.setFocusEmptyCartHeading = function (liveMsg) {
		setTimeout(function () {
			$("#empty-cart-heading").focus().after(function() {
				scope.sendLiveMessage(liveMsg, 500);
			});
		}, 0);
	}
	setTimeout(function() {
		var firstCartItemIfAny = document.querySelector('table.cart-table tr.item-row div.row a');
		if (firstCartItemIfAny)
			firstCartItemIfAny.focus();
	}, 0);
}
