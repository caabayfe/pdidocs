function onLoad() {
   //Type appropriate comment here, and begin script below
   // Get the referenced record
    var documentRecord = g_form.getReference('document');
    // Check if the referenced record is available
    if (documentRecord) {
        // Get the value from the referenced record's column
        var external = documentRecord.external;
		g_form.setDisplay('external_version_id', external);
		g_form.setDisplay('mp_document_version', external);
    }
	/* else condition is not required here because documentRecord will be empty only when
	* a user is directly opeing the new version record page and not from related list. In this 
	* case document is not passed in the query and hence field is empty. We have made document field
	* as mandatory so a user who is directly opening the form like <instance>/ds_document_version
	* and trying to submit with an empty document field, it gives an error.
	**/ 
}
