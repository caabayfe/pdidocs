(function process(request, response) {
    publishApp(request, response);

    // ScopedAppUploaderAJAX is migrated as-is from the original sys_processor. It reads
    // sysparm_* values via AbstractAjaxProcessor.getParameter(), which the Scripted REST API
    // request object doesn't support directly, so requestShim bridges getParameter() to the
    // JSON body (sysparm_transaction_scope is the only sysparm_* value read off the query
    // string instead, since the platform needs it there to switch scope before this script runs).
    // Params go in the body rather than the query string so sensitive values
    // (sysparm_password, sysparm_ck) don't end up in the URL, access logs, or Referer headers.
    function publishApp(request, response) {
        var requestShim = {
            getParameter: function(name) {
                return getParam(request, name);
            }
        };
        var processor = new sn_appauthor.ScopedAppUploaderAJAX(requestShim, response, response);
        var result = processor.start();

        // setBody() can only bridge an object, not a bare string, so wrap the progress id.
        response.setBody({
            progressId: result === null || result === undefined ? '' : String(result)
        });
    }

    function getParam(request, name) {
        var data = request.body && request.body.data;
        if (!data)
            return null;

        var value = data[name];
        return (value === undefined || value === null) ? null : value;
    }

})(request, response);
