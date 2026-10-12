(function() {
    // Get the right table name of the child table
    var gr = new GlideRecord(current.sys_class_name);
    var oldSysId = current.getValue('sys_id');
    if (gr.isValid() && gr.get(current.sys_id)) {
        gr.name = gr.name + "_copy";
        gr.number = '';
        gr.state = 'new';
        gr.processed_at = null;
        gr.results = '';
        var newSysId = gr.insert();
        var msf = new MIDDeploymentRequest(newSysId);
        msf.clone(oldSysId, newSysId);
        var escapedNameStr = GlideStringUtil.escapeHTML(current.name);
        gs.addInfoMessage(gs.getMessage('Duplicated {0} ({1})', [current.number, escapedNameStr]));
        action.setRedirectURL(gr);
        return;
    }
    gs.addErrorMessage(gs.getMessage('Could not duplicate. Failed to get record with sys_id {0} from table {1}', [current.sys_id, current.sys_class_name]));
    action.setRedirectURL(current);
})();
