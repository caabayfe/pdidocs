(function() {
    var localInput = input; //to safeguard pullution of "input" via BR or other scripts

    var m = data.msgs = {};
    m.itemRemovedMsg = gs.getMessage("has been removed from your Wish List");
    m.removeItemConfirmationMsg = gs.getMessage("Are you sure you want to remove this item from Wish List?");
    m.removeEditingItemMsg = gs.getMessage("Are you sure you want to remove the item you are viewing from your Wish List?");
    m.clearWishlistConfirmationMsg = gs.getMessage("Are you sure you want to empty your Wish List?");
    m.wishlistEmptiedMsg = gs.getMessage("Your wishlist has been cleared");

    var userID = gs.getUser().getID();
    var cart = new SPCart("saved_items", userID);
    data.cartID = cart.getCartID().toString();
    data.user_id = userID;

    if (localInput && localInput.action === "clear_cart")
        cart.clearCart();

    if (localInput && localInput.action === "remove_item") {
        var wishlistCart = new sn_sc.CartJS("saved_items");
        wishlistCart.remove(localInput.removeItemID);
        if (!gs.nil(localInput.attachmentTable)) {
            var targetRecordGr = new GlideRecord(localInput.attachmentTable);
            if (targetRecordGr.isValid()) {
                targetRecordGr.get(localInput.removeItemID);
                new GlideSysAttachment().deleteAll(targetRecordGr);
            }
        }
    }

    data.cartItems = cart.getItems();
    data.cartItems.map(function(item) {
        if (item.can_order)
            item.item_url = "?id=sc_cat_item&sys_id=" + item.sys_id + "&edit=wishlist";
    });
    $sp.logStat('Wishlist View', 'sc_cart', '', 'saved_items', $sp.getPortalRecord().getUniqueValue());
})();
