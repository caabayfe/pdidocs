updateDialogHeader();

function updateDialogHeader() {
	var hasError = "$[jvar_hasError]";
	var modalHeaderPublish = "$[jvar_modalHeaderPublish]";
	var modalHeaderPublishToMyAppRepo = "$[jvar_modalHeaderPublishToMyAppRepo]";

	var header = document.getElementById('sn_appauthor_skipped_records_warning_dialog_title');
	if (hasError != "true")
		header.innerHTML = modalHeaderPublish;
	else
		header.innerHTML = modalHeaderPublishToMyAppRepo;
}

/* Event Handlers */

function onContinue() {
    GlideModal.get().fireEvent("continueAppPublish");
    GlideModal.get().destroy();
}

function onViewDetails(viewDetailsLink) {
    window.open(viewDetailsLink, '_blank');
    GlideModal.get().destroy();
}
