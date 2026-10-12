function(scope, elm) {
	// Set the focus back on the input for IE11
	var $timeout = $injector.get('$timeout');
    $timeout(function() {
        var postInput = elm[0].querySelector('#post-input');
        if (postInput) {
            postInput.dispatchEvent(new Event('input'));
        }
    }, 0);
    scope.setFocus = function() {
        var input = $(elm[0]).find('textarea#post-input');
        if (input[0])
            input[0].focus();
    }
}
