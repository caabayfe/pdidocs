(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var diff = new ArrayUtil().diff((previous.getValue('sc_catalogs') || '').split(','), (current.getValue('sc_catalogs') || '').split(','));
    for (var i = 0; i < diff.length; i++) {
        var gr = new GlideRecord('sc_catalog');
        gr.get(diff[i]);
        if (gr.getValue('manager') != gs.getUserID() && gr.editors.toString().indexOf(gs.getUserID()) == -1) {
            gs.addErrorMessage(gs.getMessage('Due to access restrictions, this action is not allowed as you cannot change some or all of the selective catalog(s).'));
            current.setAbortAction(true);
            break;
        }
    }
})(current, previous);
