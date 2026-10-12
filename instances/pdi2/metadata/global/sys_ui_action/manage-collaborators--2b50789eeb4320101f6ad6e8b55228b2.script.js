function launchManageCollabUI() {
	var width = window.top.innerWidth - 40;
	if (typeof rowSysId == 'undefined')
		sysId = g_form.getUniqueValue();
	else
		sysId = rowSysId;

	var url = 'sn_collab_request_manage_collaborators.do?sysparm_nostack=true&sysparm_transaction_scope=' + sysId;
	var modal = new GlideModal(guid(), false, width);
	modal.setTitle(new GwtMessage().getMessage('Manage Collaborators'));
	modal.setAutoFullHeight(true);
	modal.renderIframe(url, function provideDDUserManagerReferenceToModalCloser(){
		this.modal = modal;
	});
}
