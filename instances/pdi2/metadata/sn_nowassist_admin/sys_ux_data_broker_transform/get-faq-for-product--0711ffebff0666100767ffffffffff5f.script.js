function transform(input) {
    try {
        var productId = input.product_id;

        var featuresByProduct = (gs.nil(input.selected_feature) || input.selected_feature.length<1 || input.selected_feature[0] =='all' )  ? NAAWorkFlowFeatureUtil.getFeatures(productId).map(feature => feature.id) : input.selected_feature;

       
        var faqData = NAAWorkFlowFeatureUtil.getFAQsForProductPaginated(featuresByProduct, input.page_number, input.record_per_page, input.faq_search_term, input.sort_by[0]);
        
        return {
            faq: faqData?.faq,
			      totalFaqCount: faqData?.totalFaqCount
        };
    } catch(e) {
        gs.error("Get FAQs: Failed fetch faq for Product - " + e.toString());
        throw new Error("Failed fetch faq for Product");
    }
}
