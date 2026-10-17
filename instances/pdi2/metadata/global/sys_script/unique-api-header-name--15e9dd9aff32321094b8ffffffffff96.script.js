(function executeRule(current, previous /*null when async*/ ) {

    var api = current.api;
    var headerName = current.name;

    var gr = new GlideRecord("sys_ws_response_header");
    gr.addQuery("api", api);
    gr.addQuery("name", headerName);
    gr.query();

    if (gr.next() && gr.sys_id != current.sys_id) {
        gs.addErrorMessage(gs.getMessage('Duplicate entry for unique combination of {0}:{1}', [api, GlideStringUtil.escapeHTML(headerName)]));
        current.setAbortAction(true);
    }

})(current, previous);
