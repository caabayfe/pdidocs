(function executeRule(current, previous /*null when async*/) {
	// check if this is a codesigning certificate attachment.
	var codeSigningKeyUtil = new sn_kmf.CodeSigningKeyCertUtil();
    var result = codeSigningKeyUtil.isCodeSigningCertAttachmentWithDocId(current.table_name, current.table_sys_id);
    if (!result.status) {
        return; // pass
    } else {
        if (result.msg) {
            if (current.operation() === 'delete') {
                gs.addErrorMessage(gs.getMessage(result.msg));
                current.setAbortAction(true);
                return;
            }
        }

        // Abort if the user has no security admin or sn_kmf.cryptographic manager role
        if (gs.hasRole("security_admin") && gs.getSession().getRoles().includes("sn_kmf.cryptographic_manager")) {
            return; // pass
        } else {
            gs.addErrorMessage(gs.getMessage("Require security admin and sn_kmf.cryptographic manager roles to delete/update certificate on sys_attachment table. This action is aborted"));
            current.setAbortAction(true);
        }
    }

})(current, previous);
