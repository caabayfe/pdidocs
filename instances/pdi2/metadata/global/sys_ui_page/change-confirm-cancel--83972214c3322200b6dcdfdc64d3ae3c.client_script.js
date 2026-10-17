function cancelChangeRequest() {
	var textArea = $("change_confirm_reason_text");
	if (textArea)
		moveToCancel(textArea.value.trim());
}

(function() {
	$("change_confirm_reason_text").focus();
})();
