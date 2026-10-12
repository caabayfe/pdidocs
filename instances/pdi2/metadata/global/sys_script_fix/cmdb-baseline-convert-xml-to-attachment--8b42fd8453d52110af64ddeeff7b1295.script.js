function copyBLEXMLToAttachment(entryId) {
    // check for baseline entry record
    var grBLEntry = new GlideRecord('cmdb_baseline_entry');
    if (!grBLEntry.get(entryId)) {
        gs.log('Failed to find Baseline entry record for sys_id:' + entryId);
        return;
    }

    // check for existing attachment for baseline entry record
    var grAttachment = new GlideRecord('sys_attachment');
    grAttachment.addEncodedQuery('table_name=cmdb_baseline_entry^table_sys_id=' + entryId);
    grAttachment.query();
    if (grAttachment.getRowCount() != 0) {
        gs.log('Found existing attachment(s) for baseline entry record with sys_id:' + entryId);
        return;
    }

    // validate XML data
    var xmlString = grBLEntry.getValue('baseline_xml');
    if (!xmlString || xmlString.toString() == "") {
        gs.log('No data found in XML field for baseline entry with sys_id:' + entryId);
        return;
    }
	try{
		var xmlDoc = new XMLDocument2();
		xmlDoc.parseXML(xmlString);
		if (!xmlDoc || xmlDoc.toString() == "") {
			gs.log('Contents of XML field are not valid XML for baseline entry with sys_id:' + entryId);
			return;
		}
	} catch(err) {
		gs.error('Problem parsing XML field for CMDB Baseline Entry with sys_id:' + entryId + '. Error:' + err.message);
		return;
	}

    // create the attachment
    var att = new GlideSysAttachment();
    var attachmentId = att.write(grBLEntry, 'xml_' + entryId + '.xml', 'application/xml', xmlDoc.toString());
    gs.log('Attachment created successfully with attachment sys_id:' + attachmentId);
}

if(gs.getProperty('com.cmdb.baseline.entry.attachment')) {
    var grEntry = new GlideRecord('cmdb_baseline_entry');
    grEntry.orderBy('baseline');
    grEntry.query();
    while (grEntry.next()) {
        copyBLEXMLToAttachment(grEntry.getUniqueValue());
    }
} else {
    gs.log('com.cmdb.baseline.entry.attachment property is not set to true, so skipping attachment creation for baseline entries. Please, run this fix script after enabling that property');
}
