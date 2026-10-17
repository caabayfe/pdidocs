function transform(input) {
    var util = new sn_cmdb_ws.DedupeTemplateLibraryUtil();
    var libraries = util.getLibraries(input.searchTerm, '');
    var result = [];

    for (var i = 0; i < libraries.length; i++) {
        var library = {};
        library.id = libraries[i].sys_id;
        library.label = libraries[i].name;
        library.subLabel = libraries[i].description;
        result.push(library);
    }
    result.sort(function(r1, r2) {
        if (r1.label < r2.label) {
            return -1;
        } else {
            return 1;
        }
    });
    if (input.includeAllOptions && input.includeAllOptions == true) {
        var allTemplatesSelection = {
            'id': '',
            'label': gs.getMessage('All libraries'),
            'subLabel': gs.getMessage('All libraries')
        };
        result.unshift(allTemplatesSelection);
    }

	if (input.includeNoneOption && input.includeNoneOption == true) {
		var noneLibrary = {
			id: "none",
			label: gs.getMessage("Select a library"),
			subLabel: ''
		};
		result.unshift(noneLibrary);
	}

    return {
        result: result
    };
}
