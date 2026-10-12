function($scope, spUtil, $location, spModal, spAriaUtil, $window) {
    var c = this;
    c.m = $scope.data.msgs;

    $scope.$on("$sp.service_catalog.wishlist.update", function(evt, item_id) {
        $scope.wishlist_item_id = item_id;
        $scope.server.update().then(function() {
            $scope.$emit("$sp.service_catalog.wishlist.count", getItemCount());
        });
    });

    $scope.$on("$sp.service_catalog.item.close", function() {
        $scope.wishlist_item_id = null;
    });

    c.removeItem = function(item) {
        var urlId = $window.location.search.split('sys_id=')[1];
        if (urlId)
            urlId = urlId.split('&')[0];
        var isEdited = $scope.wishlist_item_id === item.sys_id || urlId === item.sys_id;
        var dialogMsg = isEdited ? c.data.msgs.removeEditingItemMsg : c.data.msgs.removeItemConfirmationMsg;
        spModal.confirm(dialogMsg).then(function(confirmed) {
            if (confirmed) {
                $scope.server.get({
                    cartName: "saved_items",
                    action: "remove_item",
                    removeItemID: item.sys_id,
                    attachmentTable: item.attachment_table
                }).then(function(response) {
                    c.data.cartItems = response.data.cartItems;
                    $rootScope.$broadcast("$sp.service_catalog.wishlist.update", item.item_id);
                    if (response.data.cartItems.length == 0) {
                        spUtil.addTrivialMessage(c.data.msgs.wishlistEmptiedMsg);
                        $scope.setFocusEmptyWishlistHeading(item.name + " " + c.data.msgs.itemRemovedMsg);
                    } else
                        $('#main-wishlist-header').focus().after(function() {
                            $scope.sendLiveMessage(item.name + " " + c.data.msgs.itemRemovedMsg, 500);
                        });
                    if (isEdited)
                        $window.location.href = '?id=sc_wishlist';
                });
            }
        });
    }

    c.clearCart = function() {
        spModal.confirm(c.data.msgs.clearWishlistConfirmationMsg).then(function(confirmed) {
            if (confirmed) {
                c.server.get({
                    action: "clear_cart"
                }).then(function(response) {
                    c.data.cartItems = response.data.cartItems
                    $rootScope.$broadcast("$sp.service_catalog.wishlist.update");
                    spUtil.addTrivialMessage(c.data.msgs.wishlistEmptiedMsg);
                    $scope.setFocusEmptyWishlistHeading(c.data.msgs.wishlistEmptiedMsg);
                });
            }
        });
    }

    c.KEYS = {
        DOWN: 40,
        UP: 38
    };

    c.onKeyDown = function(e) {
        var target = e.currentTarget;
        var selectables = $('#small-wishlist').children().find("a:visible, button:visible");
        var index = selectables.index(target);
        if (e.keyCode == c.KEYS.UP) {
            e.preventDefault();
            e.stopPropagation();
            selectables.eq(index - 1).focus();
        } else if (e.keyCode == c.KEYS.DOWN) {
            e.preventDefault();
            e.stopPropagation();
            if (index == selectables.size() - 1) index = -1;
            selectables.eq(index + 1).focus();
        }
    }

    $scope.orderByDate = function(item) {
        var date = new Date(item.sys_updated_on).getTime();
        return date;
    }

    $scope.$emit("$sp.service_catalog.wishlist.count", getItemCount());

    function getItemCount() {
        return c.data.cartItems.length || 0;
    }

    if (c.options.auto_update_wishlist === true || c.options.auto_update_wishlist === "true") {
        spUtil.recordWatch($scope, 'sc_cart_item', 'cart.name=saved_items^cart.user=' + $scope.data.user_id, function(resp) {
            $rootScope.$broadcast("$sp.service_catalog.wishlist.update", $scope.wishlist_item_id);
        });
    }

    $scope.sendLiveMessage = function(message, timeout) {
        if (!message)
            return;

        if (!timeout)
            timeout = 0;

        setTimeout(function() {
            spAriaUtil.sendLiveMessage(message);
        }, timeout);
    }
}
