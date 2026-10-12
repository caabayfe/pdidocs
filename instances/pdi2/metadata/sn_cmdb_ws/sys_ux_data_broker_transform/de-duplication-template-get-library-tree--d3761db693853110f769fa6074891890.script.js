function transform(input) {
    var searchTerm = input.searchTerm;
    var libraryMap = {};
    var gr = new GlideRecord('reconcile_duplicate_template');
    gr.addQuery('state', "!=", "retired");

	//case when library dropdown is selected
    if (input.librarySysId) {
        gr.addQuery('library', input.librarySysId);
    }

	//Add search term query, can match both library name and template name
    if (searchTerm) {
        gr.addEncodedQuery('libraryLIKE' + GlideStringUtil.escapeQueryTermSeparator(searchTerm) + '^ORnameLIKE' + GlideStringUtil.escapeQueryTermSeparator(searchTerm), true);
    }
    gr.query();
    while (gr.next()) {
        var libraryId = gr.getValue('library');
        //excluding template which do not have associated library
        if (!libraryId) {
            continue;
        }
        var library = {};
        if (libraryMap[libraryId]) {
            library = libraryMap[libraryId];
        } else {
            library.id = libraryId;
            library.label = gr.library.name.toString();
            library.subLabel = gr.library.description.toString();
            library.expanded = false;
            if (searchTerm) {
                library.expanded = true;
            }
            library.children = [];
            libraryMap[libraryId] = library;
        }
        var template = {
            id: gr.getUniqueValue(),
            label: gr.getValue('name'),
            type: 'template',
            sublabel: ''
        };
        var templateStateValue = gr.getValue('state');
        var templateStateDisplayValue = gr.getDisplayValue('state');
        if (templateStateValue == 'published') {
            var tgr = new GlideRecord('reconcile_duplicate_template_run');
            tgr.addQuery('template', gr.getUniqueValue());
			tgr.addEncodedQuery('stateINdraft,ready,running');
            tgr.orderBy(this.SYS_UPDATED_ON);
            tgr.query();
            if (tgr.next()) {
				template.highlightedValueProps = [{
                "label": "Running",
                "color": "blue"
            }];
            }
        }
        else if (templateStateValue == 'draft') {
            template.highlightedValueProps = [{
                "label": "Not published",
                "color": "gray"
            }];
        } 
        library.children.push(template);
    }
    //add remaining libraries with no templates associated with them
    var util = new sn_cmdb_ws.DedupeTemplateLibraryUtil();
    var libraries = util.getLibraries(searchTerm, '');
    for (var i = 0;i<libraries.length;i++) {
        var libraryNode = {};
        var librarySysId = libraries[i].sys_id;
		
		if(input.librarySysId && input.librarySysId != librarySysId){
			continue;
		}
        if (libraryMap[librarySysId]) {
            continue;
        }
        libraryNode.id = librarySysId;
        libraryNode.label = libraries[i].name;
        libraryNode.subLabel = libraries[i].description;
        libraryNode.expanded = false;
        libraryNode.children = [];
        libraryMap[librarySysId] = libraryNode;
    }
    var treeValues = [];
    for (var key in libraryMap) {
        treeValues.push(libraryMap[key]);
    }
    return {
        libraryTree: treeValues
    };
}
