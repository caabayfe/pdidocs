(function(finding) {
    var gr = new GlideRecord('sys_security_acl');
    gr.addActiveQuery();
    gr.addQuery('type', 'record');
    gr.addNullQuery('condition');
    if (gr.isValidField('security_attribute'))
        gr.addNullQuery('security_attribute');
    gr.query();
    while (gr.next()) {
        var script = '' + gr.script;
        var aclScript = script.trim();
        var grRole = new GlideRecord('sys_security_acl_role');
        grRole.addEncodedQuery("sys_security_acl=" + gr.sys_id);
        grRole.query();
        if (grRole.hasNext()) {
            while (grRole.next()) {
                var roleId = grRole.sys_user_role.sys_id;
                //check if role is public
                if (roleId == "b0593b350a0a0aa7001d689e4542dc28") {
                    if (global.JSUtil.notNil(aclScript))
                        continue;

                    finding.setCurrentSource(gr);
                    finding.increment();
                    break;
                }
            }
        } else {
            // Continue if acl has a script
            if (global.JSUtil.notNil(aclScript))
                continue;

            finding.setCurrentSource(gr);
            finding.increment();
        }
    }
})(finding);
