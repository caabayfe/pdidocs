(function executeRule(current, previous) {
    var gr = new GlideRecord("sys_openapi_operation");
    gr.addQuery("name", current.name);
    gr.addQuery("openapi", current.openapi);
    gr.query();
    if (gr.next() && gr.sys_id != current.sys_id) {
        if (gr.getValue('name') == current.http_method.toString().toUpperCase() + ' ' + current.path) {
            gs.addErrorMessage(gs.getMessage("Open API operation with the name '{0}' already exists.", [GlideStringUtil.escapeHTML(current.name)]));
            current.setAbortAction(true);
        } else {
            var existingGrName = gr.getValue('name');
            var existingGrMethod = gr.getValue('http_method');
            var existingGrPath = gr.getValue('path');
            var updatedName = existingGrName + ' - ' + '(' + existingGrMethod.toString().toUpperCase() + ')' + ' ' + existingGrPath;
            gr.setValue('name', updatedName);
            gr.update();
            current.name = current.name + ' - ' + '(' + current.http_method.toString().toUpperCase() + ')' + ' ' + current.path;
        }
    }
})(current, previous);
