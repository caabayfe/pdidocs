function ok() {
    var itemId = '${sysparm_item_id}';
    var checkoutUtil = new GlideAjax('ServiceCatalogVersioningUtils');
    checkoutUtil.addParam('sysparm_name', 'cancelCheckout');
    checkoutUtil.addParam('itemId', itemId);
    checkoutUtil.getXMLAnswer(cancelCheckoutDone);
    destroyDialog();
    var cancelBtn = document.getElementById('cancel_checkout');
	var cancelBtnBottom = document.getElementById('cancel_checkout_bottom');
    if (cancelBtn)
        cancelBtn.disabled = true;
	if (cancelBtnBottom)
		cancelBtnBottom.disabled = true;
    return true;
}

function cancel() {
    destroyDialog();
    return false;
}

function cancelCheckoutDone(status) {
    if (status == "true") {
		var item_state = '${sysparm_state}';
		if (item_state && item_state == 'draft') 
			g_navigation.open("sc_cat_item_list.do");
		else 
			g_navigation.reloadWindow();
    }
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
