if (current.isNewRecord())
	answer = true;
else {
	var a = new global.DocumentObjectSecurity();
	var gr = new GlideRecord(current.table_name);
	if (gr.get(current.target_record))
		answer = gr.canRead() && a.canReadFolderId(current.folder);
	else 
		answer = false;
}
