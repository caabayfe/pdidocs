var CatalogSaveUtility = Class.create();
CatalogSaveUtility.prototype = {
    initialize: function() {},
    processAddItem: function(request, response, isWishlist) {
        var request_body = request.body.nextEntry();
        var quantity;
        if (request_body.sysparm_quantity)
            quantity = '' + request_body.sysparm_quantity;
        else
            quantity = 1;

        if (!/^\+?([0-9]*)$/.test(quantity))
            throw new sn_ws_err.BadRequestError("Invalid Quantity value");
        else
            //Force convert quantity to String
            request_body.sysparm_quantity = "" + quantity;

        var also_request_for = request_body.sysparm_also_request_for;
        if (!gs.nil(also_request_for))
            throw new sn_ws_err.BadRequestError("Items with Also request for cannot be " + (isWishlist ? "added to wishlist" : "saved"));

        var itemId = '' + request.pathParams.sys_id;
        var catItem = new sn_sc.CatItem(itemId);
        if (!catItem.canView())
            throw new sn_ws_err.BadRequestError(isWishlist ? "Security constraints prevent adding item to Wish List" : "Security constraints prevent saving the item");

        var restUtil = new RestCatalogUtil();
        for (var key in request_body.variables)
            if (request_body.variables.hasOwnProperty(key) && request_body.variables[key] != null && typeof(request_body.variables[key]) !== 'string')
                request_body.variables[key] = restUtil.getFieldValueAsString(key, request_body.variables[key], itemId);

        if (isWishlist && !restUtil.canAddItemToWishlist(itemId))
            throw new sn_ws_err.BadRequestError("Item cannot be added to Wish List");

        var messages = restUtil.validateVariableRegex(itemId, request_body.variables);
        if (messages && messages.length > 0) {
            var errorResponse = {};
            errorResponse.errMsg = messages.join();
            response.setStatus(400);
            return errorResponse;
        }
        request_body.sysparm_id = itemId;
        var existingWishlistID = request_body.wishlist_item_id;
        var updateItem = false;
        var cart = new sn_sc.CartJS(isWishlist ? "saved_items" : "draft_items");
        var cartItemID = request_body.sysparm_item_guid;
        var cartItemGr = new GlideRecord('sc_cart_item');
        if (isWishlist) {
            cartItemGr.addQuery("cart", cart.getCartID());
            cartItemGr.addQuery("cat_item", itemId);
            cartItemGr.query();
            if (cartItemGr.next()) {
                updateItem = true;
                existingWishlistID = cartItemGr.getUniqueValue();
            }
        } else
            updateItem = cartItemGr.get(cartItemID);

        var srcTable = 'sc_cat_item';
        var srcId = itemId;
        if (updateItem) {
            srcTable = 'sc_cart_item';
            srcId = cartItemGr.getUniqueValue();
        }

        var mrvsErrorMessages = restUtil.validateMaxRowCountMultiRowVS(srcTable, srcId, itemId, request_body.variables);
        if (mrvsErrorMessages && mrvsErrorMessages.length > 0) {
            var errors = mrvsErrorMessages.join();
            throw new sn_ws_err.BadRequestError(errors);
        }

        try {
            var response_body = {};
            request_body.is_wishlist = isWishlist;
            if (updateItem && cartItemGr.getUniqueValue() == cartItemID) {
                response_body = cart.updateCart(request_body, cartItemID, true);
                response_body.saved_cart_item_id = cartItemID;
            } else {
                var conflictingCartDomain = cart.findConflictingDomain();
                if (conflictingCartDomain) {
                    response_body.errMsg = gs.getMessage("Your {0} has item(s) belonging to '{1}' domain. To continue to add this this item, clear the {0} or order the existing item(s).", isWishlist ? "wishlist cart" : "draft item cart", conflictingCartDomain);
                    response.setStatus(400);
                    return response_body;
                }

                if (typeof cart.addItemToCart == "function")
                    response_body = cart.addItemToCart(request_body);
                else if (isWishlist) {
                    response_body = cart.addToCart(request_body);
                    if (response_body && response_body.items) {
                        for (var i = 0; i < response_body.items.length; i++) {
                            var item = response_body.items[i];
                            if (item.catalog_item_id === itemId && existingWishlistID != item.cart_item_id) {
                                response_body.saved_cart_item_id = item.cart_item_id;
                                break;
                            }
                        }
                    }
                } else
                    throw new sn_ws_err.BadRequestError("Invalid Request");

                if (response_body.errMsg) {
                    response.setStatus(400);
                    return response_body;
                }
            }

            var processedCartItemID = response_body.saved_cart_item_id;
            if (!GlideStringUtil.isEligibleSysID(processedCartItemID)) {
                response_body.errMsg = gs.getMessage("Unable to create or update the {0} item", isWishlist ? "wishlist" : "draft");
                response.setStatus(400);
                return response_body;
            }

            var currentCartItemID = request_body.current_cart_item_id;
            if (isWishlist) {
                if (processedCartItemID != existingWishlistID)
                    this.removeOutdatedCartItem(existingWishlistID, processedCartItemID, isWishlist, false, request_body.wishlistAttachmentTable);

                return gs.nil(response_body.shopping_cart_details) ? response_body : response_body.shopping_cart_details;
            } else if (GlideStringUtil.isEligibleSysID(currentCartItemID)) {
                //This boolean will help us identify if save was clicked on wishlist context or not. If cart item is same as wishlist id, it means that save was clicked on a wishlisted item.
                var isWishlistContext = (existingWishlistID == currentCartItemID);
                this.removeOutdatedCartItem(currentCartItemID, processedCartItemID, isWishlistContext, true, isWishlistContext ? request_body.wishlistAttachmentTable : "");
            }

            return response_body;
        } catch (e) {
            var catalogExceptionUtils = new global.CatalogExceptionUtils();
            if (catalogExceptionUtils.isCartException(e)) {
                response.setStatus(400);
                return catalogExceptionUtils.handleCartExceptionInPortal(e);
            }

            gs.error(e);
            throw new sn_ws_err.BadRequestError("Invalid Request");
        }
    },
    removeOutdatedCartItem: function(oldItemID, newItemID, isWishlist, copyAttachments, attachmentTable) {
        if (!GlideStringUtil.isEligibleSysID(oldItemID))
            return;

        if (copyAttachments)
            new global.GlobalServiceCatalogUtil().moveAllCatalogAttachments(oldItemID, newItemID, attachmentTable);

        var cart = new sn_sc.CartJS(isWishlist ? "saved_items" : "");
        cart.remove(oldItemID);
        //We attach attachments against the table for record producer, hence cleaning if there are any such attachments.
        if (!gs.nil(attachmentTable))
            new global.GlobalServiceCatalogUtil().deleteAttachments(attachmentTable, oldItemID);
    },

    type: 'CatalogSaveUtility'
};
