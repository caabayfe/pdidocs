function transform(input) {
    /*
    	Given the library sysID, fetch all the associated templates
    */
    var result = {};
	var templates = [];

	// on Edit assigned tasks page, we want to include this option,
	// but in Remediate modal, we do not want to display it
	if (input.includeNoneOption && input.includeNoneOption == true) {
		var noneTemplate = {
			id: "none",
			label: gs.getMessage("Select a template"),
			sublabel: ''
		};

		templates.push(noneTemplate);
	}

	var library = input.librarySysId;
    if (library == '') {
        var gr = new GlideRecord('reconcile_duplicate_template');
		gr.addQuery('state', 'published');
        gr.query();
        while (gr.next()) {
            var label = gr.getValue('name');
            var id = gr.getUniqueValue();
            var template = {
                id: id,
                label: label,
                sublabel: '',
            };
            templates.push(template);
        }
    } else {
		var util = new sn_cmdb_ws.DedupeTemplateLibraryUtil();
        var templatesForLibrary = util.getTemplatesByLibrary(library, '');
        for (var i = 0; i < templatesForLibrary.length; i++) {
            var curTemplate = templatesForLibrary[i];
            if (curTemplate.state == "Not Published") {
                continue;
            }
            var templateObject = {
                id: curTemplate.sys_id,
                label: curTemplate.name,
                sublabel: ''
            };
            templates.push(templateObject);
        }
    }
    result = {
        templates: templates
    };
    return result;
}
