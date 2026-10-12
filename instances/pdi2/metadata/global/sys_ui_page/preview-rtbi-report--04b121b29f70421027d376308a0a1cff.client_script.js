var prefilledBody = '';

function cancel() {
    GlideDialogWindow.get().destroy();
}

function onCancel() {
    cancel();
    return false;
}

function onTargetChange() {
    var targetId = trim(gel('target_record').value);
    if (targetId) {
        gel('content_id').style.height = (window.innerHeight - 450) + 'px';
        showPrefilledBody(targetId);
    } else {
        gel('content_id').style.height = 0;
        gel('dialog_footer').style.display = "none";
    }
}

function onGeneratePreview() {
    previewDocument();
    cancel();
    return false;
}

function showPrefilledBody(user) {
    var ga = new GlideAjax('RTBIUtilAjax');
    ga.addParam('sysparm_name', 'getPrefilledBody');
    ga.addParam('rtbi_report_id', gel('rtbi_report_id').value);
    ga.addParam('sysparm_target_user', user);
    ga.getXMLAnswer(function(answer) {
        prefilledBody = answer;
		gel('content_id').innerHTML = prefilledBody;
    });
}

function previewDocument() {
	var targetId = trim(gel('target_record').value);
    var ga = new GlideAjax('RTBIUtilAjax');
    ga.addParam('sysparm_name', 'generatePreviewDocument');
    ga.addParam('sysparm_html_body', prefilledBody);
    ga.addParam('rtbi_report_id', gel('rtbi_report_id').value);
	ga.addParam('sysparm_target_user', targetId);
    ga.getXMLAnswer(function(answer) {
        if (!answer) {
            g_form.addErrorMessage(getMessage('Unable to preview document due to an error'));
            return;
        }
        var attachmentId = answer;
        var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
        var dialog = new dialogClass('rtbi_report_preview_pdf');
        dialog.setTitle(getMessage('Preview Report'));
        dialog.setPreference('sysparm_attachmentId', attachmentId);
        dialog.setWidth(900);
        dialog.render();
    });
}
