function transform(input) {
	var result = {};
	var libraryName = input.libraryName;
	var libraryDescription = input.libraryDescription;
    var util = new sn_cmdb_ws.DedupeTemplateLibraryUtil();
	result = util.createLibrary(libraryName, libraryDescription);
	return result; 
}
