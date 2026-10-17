domainCascadeDocuments();

function domainCascadeDocuments() {
    // make current transaction uncancelable while this rule runs,
    // set variable to previous cancelable state to restore when done
    var isCancelable = gs.setCannotCancel(true);

    if (current.owner.sys_domain != 'global') {
        gs.log("Update Version, References and Permissions table domain based on domain change of Documents table: " + current.sys_id);

        current.sys_domain = current.owner.sys_domain;

        var documentDomainDefaultUtil = new global.DocumentManagementDomainCascade();
        documentDomainDefaultUtil.updateTableDomain('ds_document_version', 'document', current.sys_id, current.owner.sys_domain);
        documentDomainDefaultUtil.updateTableDomain('ds_document_references', 'document', current.sys_id, current.owner.sys_domain);
        documentDomainDefaultUtil.updateTableDomain('ds_document_permission', 'document', current.sys_id, current.owner.sys_domain);
    } else {
        gs.log("Owner is changed to a global user, Domain change is not required for the owner: " + current.owner);
    }
    // restore previous cancelable state
    gs.setCannotCancel(isCancelable);
}
