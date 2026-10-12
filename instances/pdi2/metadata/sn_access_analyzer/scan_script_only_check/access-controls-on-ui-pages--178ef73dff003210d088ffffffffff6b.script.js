(function(finding) {
    var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();

    // Pre-load all UI page ACL names to avoid one query per page
    var uiPageAclNames = {};
    var aclGR = new GlideRecord('sys_security_acl');
    aclGR.addQuery('type', 'ui_page');
    aclGR.query();
    while (aclGR.next()) {
        uiPageAclNames[aclGR.getValue('name')] = true;
    }

    var grUiPage = new GlideRecord("sys_ui_page");
    grUiPage.addQuery('html', 'CONTAINS', ':evaluate');
    grUiPage.query();

    while (grUiPage.next()) {
        // Skip OOB records and only evaluate customer-modified or custom records
        if (!accessAuditorUtil.isCustomRecord(grUiPage)) {
            continue;
        }

        if (!uiPageAclNames[grUiPage.getValue('name')]) {
            var uiPageLink = accessAuditorUtil.getRecordLink(grUiPage, grUiPage.name);
            finding.setCurrentSource(grUiPage);

            var remediation = "UI Page " + uiPageLink +
                " lacks an ACL and script-level authorization checks, allowing any logged-in internal user to access it. " +
                "This may enable unauthorized actions, such as changing passwords by passing a user’s sys_id and new password. " +
                "Remediate by implementing appropriate ACLs and script-level authorization (e.g. role checks) to restrict access to authorized users only.";

            finding.setValue("finding_details", remediation);
            finding.increment();
        }
    }
    // Free memory
    uiPageAclNames = null;
})(finding);
