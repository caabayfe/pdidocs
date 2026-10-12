function ok() {
    var itemId = '${sysparm_item_id}';
    var checkoutUtil = new GlideAjax('ServiceCatalogVersioningUtils');
    checkoutUtil.addParam('sysparm_name', 'cancelReview');
    checkoutUtil.addParam('itemId', itemId);
    checkoutUtil.getXMLAnswer(cancelReviewDone);
    destroyDialog();
    var cancelBtn = document.getElementById('cancel_review');
	var cancelBtnBottom = document.getElementById('cancel_review_bottom');
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

function cancelReviewDone(status) {
    if (status == "true") {
		g_navigation.reloadWindow();	
    }
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
