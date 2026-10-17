function transform(input) {
	var result = {};
	var libraryName = input.newLibraryName;
	var libraryDescription = input.newLibraryDescription;
	var sysId = input.sysId;
    var util = new sn_cmdb_ws.DedupeTemplateLibraryUtil();
	result = util.updateLibrary(sysId, libraryName, libraryDescription);
	return result; 
}
