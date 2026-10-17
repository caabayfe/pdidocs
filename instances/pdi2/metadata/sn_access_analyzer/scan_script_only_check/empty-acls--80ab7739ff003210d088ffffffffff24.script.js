(function(finding) {
    var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();
    var PUBLIC_ROLE_ID = 'b0593b350a0a0aa7001d689e4542dc28';
    var fullScanEnabled = global.JSUtil.toBoolean(gs.getProperty('glide.security.empty_acl_check.full_scan', 'false'));

    var gr = new GlideRecord('sys_security_acl');
    gr.addActiveQuery();
    gr.addNullQuery('condition');
    if (!gr.isValidField('security_attribute')) return;
    gr.addNullQuery('security_attribute');
    gr.query();

    // Pass 1: collect candidate ACL data (avoids holding GlideRecord cursors open)
    var candidateAcls = [];
    var candidateIds = [];
    while (gr.next()) {
        if (!fullScanEnabled && !accessAuditorUtil.isCustomRecord(gr)) continue;
        var aclId = gr.getUniqueValue();
        candidateIds.push(aclId);
        candidateAcls.push({
            sys_id: aclId,
            name: gr.getValue('name'),
            decision_type: gr.getDisplayValue('decision_type'),
            type: gr.getDisplayValue('type'),
            operation: gr.getDisplayValue('operation'),
            script: ('' + gr.script).trim()
        });
    }

    if (candidateIds.length === 0) return;

    // Pass 2: batch-load roles for all candidate ACLs (replaces one query per ACL)
    var aclRoleMap = {}; // aclId → [roleId, ...]
    var grRole = new GlideRecord('sys_security_acl_role');
    grRole.addQuery('sys_security_acl', 'IN', candidateIds.join(','));
    grRole.query();
    while (grRole.next()) {
        var aclId = grRole.getValue('sys_security_acl');
        if (!aclRoleMap[aclId]) aclRoleMap[aclId] = [];
        aclRoleMap[aclId].push('' + grRole.getValue('sys_user_role'));
    }

    // Pass 3: determine which ACLs need findings using the same logic as before:
    //   - No roles + no script → finding
    //   - Has public role + no script → finding
    //   - Has only non-public roles → no finding
    var findingAclIds = [];
    var aclDataById = {};
    for (var i = 0; i < candidateAcls.length; i++) {
        var acl = candidateAcls[i];
        aclDataById[acl.sys_id] = acl;
        var roles = aclRoleMap[acl.sys_id] || [];
        if (roles.length === 0) {
            if (!global.JSUtil.notNil(acl.script)) findingAclIds.push(acl.sys_id);
        } else {
            var hasPublicRole = false;
            for (var r = 0; r < roles.length; r++) {
                if (roles[r] === PUBLIC_ROLE_ID) {
                    hasPublicRole = true;
                    break;
                }
            }
            if (hasPublicRole && !global.JSUtil.notNil(acl.script)) findingAclIds.push(acl.sys_id);
        }
    }

    if (findingAclIds.length === 0) return;

    // Pass 4: batch-query finding ACLs for GlideRecord objects (needed for setCurrentSource/getRecordLink)
    var grFinding = new GlideRecord('sys_security_acl');
    grFinding.addQuery('sys_id', 'IN', findingAclIds.join(','));
    grFinding.query();
    while (grFinding.next()) {
        var aclData = aclDataById[grFinding.getUniqueValue()];
        var aclLink = accessAuditorUtil.getRecordLink(grFinding, aclData.name);
        var remediation = "ACL record " + aclLink + " has no conditions defined. This exposes the system to potential unauthorized access.\n\n" +
            "Details:\n" +
            "1. " + aclData.name + "\n" +
            "   a. Decision Type: " + aclData.decision_type + "\n" +
            "   b. Type: " + aclData.type + "\n" +
            "   c. Operation: " + aclData.operation + "\n\n" +
            "Remediate by reviewing and applying appropriate role, security attribute, " +
            "data condition, controlled by reference, or script to the ACL.";
        finding.setCurrentSource(grFinding);
        finding.setValue("finding_details", remediation);
        finding.increment();
    }
    // Free memory
    candidateAcls = null;
    candidateIds = null;
    aclRoleMap = null;
    findingAclIds = null;
    aclDataById = null;
})(finding);
