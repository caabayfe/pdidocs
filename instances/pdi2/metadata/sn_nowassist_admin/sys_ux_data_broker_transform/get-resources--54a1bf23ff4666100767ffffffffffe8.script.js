function transform(input) {
    try {
        var productId = input.product_id;
        var featuresByProduct = (gs.nil(input.selected_feature) || input.selected_feature.length < 1 || input.selected_feature[0] == 'all') ? NAAWorkFlowFeatureUtil.getFeatures(productId).map(feature => feature.id) : input.selected_feature;
        var resources = NAAWorkFlowFeatureUtil.getResourcesForProduct(featuresByProduct, input.faq_search_term, input.sort_by[0]);

        return {
            resources: resources
        };
    } catch {
        gs.error("Failed fetch resources for Product - " + e.toString());
        throw new Error("Failed fetch resources for Product");
    }
}
