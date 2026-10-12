function link(scope, element, attrs, controller) {
  scope.setFocusOnActionButtons = function() {
		if (scope.widget.isFocusRequired) {
			var elm = element.find('#actions-button')[0];
			elm.focus();
		}
	}
}
