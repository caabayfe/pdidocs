function(scope, elem) {
		scope.setFocusToAttachmentButton = function () {
			elem.find('.sp-attachment-add')[0].focus();
		}

		scope.setFocusToAttachment = function (attachmentId) {
			setTimeout(function () {
				var inboxArray = elem.find('#' + attachmentId);
				if (inboxArray)
					inboxArray.find('a.view-attachment').focus();
			}, 100);
		}
}
