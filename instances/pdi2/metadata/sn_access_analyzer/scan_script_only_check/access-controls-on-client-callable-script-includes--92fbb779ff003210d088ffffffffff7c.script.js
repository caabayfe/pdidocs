(function(finding) {
    var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();

    // Pre-load all client-callable SI ACL names to avoid one query per script include
    var ccsiAclNames = [];
    var aclGR = new GlideRecord('sys_security_acl');
    aclGR.addQuery('type', 'client_callable_script_include');
    aclGR.query();
    while (aclGR.next()) {
        ccsiAclNames.push(aclGR.getValue('name'));
    }

    function hasMatchingAcl(siName) {
        for (var i = 0; i < ccsiAclNames.length; i++) {
            if (ccsiAclNames[i].indexOf(siName) !== -1) return true;
        }
        return false;
    }

    var grScriptInclude = new GlideRecord("sys_script_include");
    grScriptInclude.addQuery('active', true);
    grScriptInclude.addQuery('client_callable', true);
    grScriptInclude.query();

    while (grScriptInclude.next()) {
        // Skip OOB records and only evaluate customer-modified or custom records
        if (!accessAuditorUtil.isCustomRecord(grScriptInclude)) {
            continue;
        }

        if (!hasMatchingAcl(grScriptInclude.getValue('name'))) {
            finding.setCurrentSource(grScriptInclude);
            var scriptIncludeLink = accessAuditorUtil.getRecordLink(grScriptInclude, grScriptInclude.name);
            var remediation = "Client callable Script Include " + scriptIncludeLink +
                " is not secured with required roles, potentially allowing unauthorized access to privileged functionality. " +
                "Remediate by restricting this Script Include to appropriate roles to ensure only authorized users can execute it by creating related ACL.";

            finding.setValue("finding_details", remediation);
            finding.increment();
        }
    }
    // Free memory
    ccsiAclNames = null;
})(finding);
