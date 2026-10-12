(function(context, pageParams, blockcontext) {
    var workflow = pageParams.workflow;
    var productId = pageParams.productId;
    var breadcrumbs = [{
        "label": gs.getMessage("Now Assist Features")
    }];
    var feature_products = [];
    var selectedProduct = [];
    var features = [];
    var skills = [];
    var productFeatures = [];
    var payload = [];
    var showAlert = false;
    var showGrid = true;
    var showDropdown = true;
    var alertMessage = '';
    var currentProduct = {};

    var selectedWorkflow = sn_nowassist_admin.NAAWorkFlowFeatureUtil.getFeatureById(workflow);

    var pluginUrl = "/now/now-assist-admin/plugins/params/workflow/" + selectedWorkflow.id;

    var products = sn_nowassist_admin.NAAWorkFlowFeatureUtil.getProducts(selectedWorkflow.id);
    if (products.length > 0) {
        products.forEach(function(product) {
            if (product.id == productId) {
                currentProduct.id = productId;
                currentProduct.label = product.label;
            }
            feature_products.push({
                "id": product.id,
                "label": product.label
            });
        });
        if (!gs.nil(productId)) {
            selectedProduct.push(productId);
        } else {
            selectedProduct.push(feature_products[0].id);
        }
        productFeatures = productId ? sn_nowassist_admin.NAAWorkFlowFeatureUtil.getFeatures(productId) :
            sn_nowassist_admin.NAAWorkFlowFeatureUtil.getFeatures(selectedProduct[0]);

        if (productFeatures.length == 0) {
            showGrid = false;
            showDropdown = true;
            showAlert = true;
            alertMessage = gs.getMessage("Install the {0} plugin to explore all skills.", currentProduct.label);
        }
    }
    // Case: Workflow with features as direct children hence considering workflow as a product.
    else {
        showDropdown = false;
        productFeatures = sn_nowassist_admin.NAAWorkFlowFeatureUtil.getFeatures(selectedWorkflow.id);
        if (productFeatures.length == 0) {
            showGrid = false;
            showAlert = true;
            alertMessage = gs.getMessage("Install a {0} plugin to begin exploring all Now Assist features and skills.", selectedWorkflow.name.toLowerCase());
        } else
            selectedProduct.push(selectedWorkflow.id);

    }

    var productLabel = '';
    var titleRef = '';
    var descriptionVal = '';
    if (!gs.nil(productId)) {
        productLabel = ": " + currentProduct.label;
        titleRef = currentProduct.label;
    } else {
        productLabel = "";
        titleRef = selectedWorkflow.name;
        descriptionVal = selectedWorkflow?.description;
    }

    breadcrumbs.push({
        "label": selectedWorkflow.name + productLabel
    });

    var title = gs.getMessage("Now Assist skills for {0}", titleRef);
    var description = descriptionVal ? descriptionVal : gs.getMessage('<p>Manage all {0} skills.', titleRef);

    if (productFeatures.length > 0) {
        payload = sn_nowassist_admin.NAAWorkFlowFeatureUtil.formattedFeaturesCTACardPayload(productFeatures);
    }

    var footerLabel = gs.getMessage("Want to activate more generative AI features for {0} workflows?", selectedWorkflow.name);

    return {
        title: title,
        description: gs.nil(description) ? ' ' : description,
        feature_products: feature_products,
        selectedProduct: selectedProduct,
        gridPayload: payload,
        footerLabel: footerLabel,
        breadcrumbs: breadcrumbs,
        showAlert: showAlert,
        showDropdown: showDropdown,
        showGrid: showGrid,
        alertMessage: alertMessage,
        pluginUrl: pluginUrl

    };


})(context, pageParams, blockcontext);
