function insertCurrentUser() {
	tinymce.activeEditor.execCommand('mceInsertContent', false, "${current_user}");
}
