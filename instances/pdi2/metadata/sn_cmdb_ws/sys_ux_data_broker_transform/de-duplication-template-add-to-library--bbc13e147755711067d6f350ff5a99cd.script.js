function transform(input) {

	var templateId = input.templateSysId;
	var libraryId = input.librarySysId;
	var util = new DedupeTemplateLibraryUtil();
	var result = util.addTemplateToLibrary(templateId,libraryId);
	return result; 

}
