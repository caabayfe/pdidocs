/**
 * This business rule is to restrict making `ecc_agent_jar` table record that is inactive and
 * have jar file(s) with same name (case-insensitive) in other records in the same table.
 * 
 * Reason: Windows and Mac OSX operating systems will treat names like `abc.jar`, `Abc.jar`, and `ABC.jar`
 * as same files (case-insensitive). This will result in endless loop of file deletion & replacement
 * which results in all MID Servers going offline.
 */
(function executeRule(current, previous) {

	function validateMidJarFileNameUniqueness() {
		var currentTableName = current.getValue('sys_class_name');
		var currentSysId = current.getValue('sys_id');
		var arrayUtil, midJarUtil, jarDetails, uniqueNames, name, errorMessage;
		var gsa = new GlideSysAttachment();
		var attachmentsGr = gsa.getAttachments(currentTableName, currentSysId);
		while(attachmentsGr.next()) {
			arrayUtil = arrayUtil || new ArrayUtil();
			midJarUtil = midJarUtil || new MIDJarUtil();
			jarDetails = jarDetails || midJarUtil.getDetailsGroupedByJarName();
			uniqueNames = uniqueNames || Object.keys(jarDetails);
			name = attachmentsGr.getValue('file_name').toLowerCase();
			if(name.indexOf('.jar') !== -1 && arrayUtil.contains(uniqueNames, name)) {
				current.setAbortAction(true);
				var msg = gs.getMessage('Unable to update this record because one or more attachments share the same name as attachments in this record: ');
				var detail = jarDetails[name][0];
				var link = '<a href="' + detail.parentUrl + '">' + detail.parentName + '</a>';
				errorMessage = msg + link + '.';
				break;
			}
		}
		if (errorMessage) gs.addErrorMessage(errorMessage);
	}

	try {
		validateMidJarFileNameUniqueness();
	} catch (err) {
		var msg = gs.getMessage('Unable to execute the business rule "Validate MID Jar filename uniqueness" on table "ecc_agent_jar"');
		gs.error(msg + ' >> ' + err);
		current.setAbortAction(true);
		gs.addErrorMessage(msg);
	}

})(current, previous);
