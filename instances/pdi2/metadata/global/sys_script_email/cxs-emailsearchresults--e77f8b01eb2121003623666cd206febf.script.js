(function() {
    var searchRequest = cxs_App.getActions("cxs_TableActions", current).getEmailSearchRequest(email_action);
    if (!searchRequest || searchRequest == null || !searchRequest.query.freetext || !searchRequest.meta.get("runAsUser"))
        return;

    var imp = new GlideImpersonate();
    var previousUserId = imp.impersonate(searchRequest.meta.get("runAsUser"));
    var searchResponse = SNC.SearchService.search(searchRequest);
    var searchResponseObj = new JSON().decode(searchResponse.toJSON());
    
    template.print(cxs_App.getActions("cxs_FormatResults", searchResponseObj).usingMacro({
        "result_header_macro": "cxs_results_header_email",
        "result_macro": "cxs_result_email"
    }));

    if (previousUserId)
        imp.impersonate(previousUserId);
})()
