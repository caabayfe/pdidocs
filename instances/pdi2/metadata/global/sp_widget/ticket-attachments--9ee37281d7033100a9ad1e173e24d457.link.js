function(scope, elem){
	scope.setFocusToAttachmentButton = function () {
		var addButton = elem.find('.sp-attachment-add')[0];
		addButton && addButton.focus();
	}
}
