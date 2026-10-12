function transform(input) {
	if(!input.librarySysId){
		return {};
	}

    var util = new sn_cmdb_ws.DedupeTemplateLibraryUtil();
	var result = util.deleteLibrary(input.librarySysId);
	return result; 
}
