function(scope, elem){
    scope.setFocusToAttachment = function () {
		setTimeout(function () {
			var inboxArray = elem.find("a.view-attachment")[0];
			if (inboxArray)
				inboxArray.focus();
		}, 100);
	}
	scope.setFocusToAttachmentButton = function () {
		elem.find('.sp-attachment-add')[0].focus();
	}
	scope.focusElement = function (selector) {
		scope.$evalAsync(function () {
			var targetElement = elem.find(selector)[0];
			if (targetElement)
				targetElement.focus();
		});
	}
	scope.$watch('c.showDeliveryAddr', function (newValue) {
		if (newValue)
			scope.focusElement('#deliver-to');
	});
	scope.$watch('c.showSpecialInstructions', function (newValue) {
		if (newValue)
			scope.focusElement('#special-instructions');
	});
}
	
