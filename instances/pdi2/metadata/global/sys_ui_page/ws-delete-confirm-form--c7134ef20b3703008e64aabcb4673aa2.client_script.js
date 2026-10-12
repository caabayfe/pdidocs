function closeModal() {
	window.location.href = window.location.href + '&sysparm_next_pg=true';
}

function ok() {
	iframeMsgHelper.confirm();
	$j('button').prop('disabled', true);
	// No need to close modal as doDelete will submit the form, causing the modal to be dismissed.
}

function cancel() {
	closeModal();
}
