(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(() => {
        if (GlidePluginManager.isActive('sn_ui_generation')) {
            try {
                var uiGenUtils = new sn_ui_generation.UIGenerationUtils();
                uiGenUtils.saveToAgenticScratch(request);
            } catch (err) {
                gs.error(err);
                apiHelper.respondUnsuccesfully();
            }
        }
        apiHelper.respondSuccesfully();
    });
})(request, response);
