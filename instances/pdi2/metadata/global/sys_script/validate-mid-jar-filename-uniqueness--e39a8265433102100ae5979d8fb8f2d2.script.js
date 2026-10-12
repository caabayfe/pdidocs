/**
 * This business rule will restrict uploading of jar files with same name (case-insensitive)
 * in the `ecc_agent_jar` table records. This validation happens before upload or renaming of a jar file.
 * 
 * Reason: Windows and Mac OSX operating systems will treat names like `abc.jar`, `Abc.jar`, and `ABC.jar`
 * as same files (case-insensitive). This will result in endless loop of file deletion & replacement
 * which results in all MID Servers going offline.
 * 
 * This will also restrict renaming of jar file with only the case changes. Example, renaming of jar file
 * `abc.jar` to `Abc.jar` will not be possible even though there is no other jar file name with that name.
 * 
 * Reason: This also falls under the endless loop problem on the MID server side since the jar file with
 * previous name already exists.
 */
(function executeRule(current, previous) {

	function validateMidJarFileNameUniqueness() {
		var currentTableSysId = current.getValue('table_sys_id');
		var fileName = current.file_name.toString();
		var lowerCasedName = fileName.toLowerCase();

		if(lowerCasedName.indexOf('.jar') !== -1) {
			var arrayUtil = new ArrayUtil();
			var midJarUtil = new MIDJarUtil();
			var jarDetails = midJarUtil.getDetailsGroupedByJarName();
			var uniqueNames = Object.keys(jarDetails);
			if (arrayUtil.contains(uniqueNames, lowerCasedName)) {
				current.setAbortAction(true);
				var detail = jarDetails[lowerCasedName][0];
				var msg = gs.getMessage('A jar file with this name already exists in this record: ');
				var link = '<a href="' + detail.parentUrl + '">' + detail.parentName + '</a>';
				var isRename = jarDetails[lowerCasedName].length === 1 && detail.parentSysId === currentTableSysId;
				if (isRename) msg = gs.getMessage("Unable to rename or attach jar files that only change the name's letter case.");
				else msg = msg + link + '.';
				gs.addErrorMessage(msg);
			}
		}
	}

	try {
		validateMidJarFileNameUniqueness();
	} catch (err) {
		var msg = gs.getMessage('Unable to execute the business rule "Validate MID Jar filename uniqueness" on table "sys_attachment"');
		gs.error(msg + ' >> ' + err);
		current.setAbortAction(true);
		gs.addErrorMessage(msg);
	}

})(current, previous);
