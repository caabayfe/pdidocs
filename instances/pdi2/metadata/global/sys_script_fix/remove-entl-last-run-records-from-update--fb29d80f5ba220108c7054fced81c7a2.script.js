deleteLicAutoEntlLastRunRecordsFromSysUpdateXML();

function deleteLicAutoEntlLastRunRecordsFromSysUpdateXML() {

    // No need to clean up the records during zbooting
    if (pm.isZboot())
        return;

	var sysUpdateXMLRecord = new GlideRecord('sys_update_xml');
	sysUpdateXMLRecord.addQuery('name', 'sys_properties_7aeb2ce30b4510102705ae9b37673ac9');
	sysUpdateXMLRecord.query();
	sysUpdateXMLRecord.setWorkflow(false);
	sysUpdateXMLRecord.deleteMultiple();
}
