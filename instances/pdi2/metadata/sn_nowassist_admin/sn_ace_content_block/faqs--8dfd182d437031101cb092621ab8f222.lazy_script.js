(function(context, pageParams, blockcontext) {
    // return some_output
    var faqsList = NAANowAssistPanelUtil.getFAQsforPanels();
    return {
        faqs: faqsList
    };

})(context, pageParams, blockcontext);
