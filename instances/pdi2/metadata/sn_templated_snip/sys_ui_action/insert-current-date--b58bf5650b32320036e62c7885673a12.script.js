function insertDate() {
	tinymce.activeEditor.execCommand('mceInsertContent', false, "${Date}");
}
