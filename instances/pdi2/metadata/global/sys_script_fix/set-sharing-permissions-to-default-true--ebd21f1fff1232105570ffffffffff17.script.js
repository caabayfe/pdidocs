// Disable reviewers column on ds_document
var docDict = new GlideRecord('sys_dictionary');
docDict.addEncodedQuery('GOTOname=ds_document^element=reviewers');
docDict.query();
if (docDict.next()) {
	docDict.setValue('read_only_option', 'strict_read_only');
	docDict.update();
}

// Update sharing permissions to default true
var docDict2 = new GlideRecord('sys_dictionary');
docDict2.addEncodedQuery('GOTOname=ds_document^element=share_access');
docDict2.query();
if (docDict2.next()) {
    docDict2.setValue('default_value', true);
    docDict2.update();
}
