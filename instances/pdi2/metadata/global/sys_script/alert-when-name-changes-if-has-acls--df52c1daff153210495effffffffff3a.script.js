(function executeRule(current, previous /*null when async*/ ) {

    var internalName = current.internal_name;
    var gr = new GlideRecord('sys_security_acl');
    gr.addQuery('name', internalName);
    gr.addQuery('type', 'AMB');
    gr.query();

    if (gr.hasNext()) {
        var warnMsg = gs.getMessage('ACLs detected on this processor. ');
        var url = "sys_security_acl_list.do?sysparm_query=name=" + internalName + "^type=AMB";
        var clickHereLink = '<a target="_blank" href="' + url + '">Click here to make necessary change.</a>';
        gs.addWarningMessage(warnMsg + clickHereLink);
    }

})(current, previous);
