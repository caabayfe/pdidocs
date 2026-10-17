function(scope, elem) {
    scope.setFocusToAttachment = function() {
        setTimeout(function() {
            var inboxArray = elem.find("a.view-attachment")[0];
            if (inboxArray)
                inboxArray.focus();
        }, 100);
    }
    scope.setFocusToAttachmentButton = function() {
        elem.find('.sp-attachment-add')[0].focus();
    }

    scope.focusElement = function(elemId, liveMessage) {
        setTimeout(function() {
            var elem = $('#' + elemId);
            if (elem)
                elem.focus().after(function() {
                    scope.sendLiveMessage(liveMessage, 500);
                });
        }, 100);
    }
}
