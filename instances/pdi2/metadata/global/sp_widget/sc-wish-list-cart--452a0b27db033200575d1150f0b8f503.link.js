function(scope, element) {
    scope.setFocusEmptyWishlistHeading = function(liveMsg) {
        setTimeout(function() {
            $("#empty-wishlist-heading").focus().after(function() {
                scope.sendLiveMessage(liveMsg, 500);
            });
        }, 0);
    }
}
