(function(context, pageParams, blockcontext) {
    var selectedProduct = blockcontext.selectedProduct;
    var showAlert = false;
    var showGrid = true;
    var alertMessage = '';
    var productFeatures = sn_nowassist_admin.NAAWorkFlowFeatureUtil.getFeatures(selectedProduct[0]);
    var productName = '';
    var productsArray = blockcontext.products;
    for (var i = 0; i < productsArray.length; i++) {
        var obj = productsArray[i];
        if (obj.id == selectedProduct[0]) {
            productName = obj.label;
            break;
        }
    }
    
    if (productFeatures.length === 0) {
        showGrid = false;
        showAlert = true;
        alertMessage = gs.getMessage("Install the {0} plugin to explore all skills.", productName);
    } else {
        var payload = sn_nowassist_admin.NAAWorkFlowFeatureUtil.formattedFeaturesCTACardPayload(productFeatures);
        //handling this to make sure to hide cards because there is filter condition in sn_nowassist_admin.NAAWorkFlowFeatureUtil.formattedFeaturesCTACardPayload(productFeatures); this has to be changed eventually.
        if(payload.length === 0){
            showGrid = false;
            showAlert = true;
            alertMessage = gs.getMessage("Install the {0} plugin to explore all skills.", productName);
        }
    }

    return {
        gridPayload: payload,
        showAlert: showAlert,
        showGrid: showGrid,
        alertMessage: alertMessage
    };


})(context, pageParams, blockcontext);
