domainCascadeFolders();

function domainCascadeFolders() {
    // make current transaction uncancelable while this rule runs,
    // set variable to previous cancelable state to restore when done
    var isCancelable = gs.setCannotCancel(true);
    if (current.owner.sys_domain != current.sys_domain) {
        gs.log("Update Folder References domain based on domain change of associated Folder: " + current.sys_id);
        current.sys_domain = current.owner.sys_domain;
        var folderDomainCascadeUtil = new global.DocumentManagementDomainCascade();
        folderDomainCascadeUtil.updateTableDomain('ds_folder_references', 'folder', current.sys_id, current.owner.sys_domain);
    } else {
        gs.log("Owner is changed to a user in the same domain, Domain change is not required for the owner: " + current.owner);
    }
    // restore previous cancelable state
    gs.setCannotCancel(isCancelable);
}
