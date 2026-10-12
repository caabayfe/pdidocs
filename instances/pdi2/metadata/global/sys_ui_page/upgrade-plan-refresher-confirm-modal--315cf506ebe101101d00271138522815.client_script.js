function executeButtonAction() {
	$j('#confirmModalAction').val('execute');
	GlideModal.get().destroy();
}

function cancelPage() {
	GlideModal.get().destroy();
}
