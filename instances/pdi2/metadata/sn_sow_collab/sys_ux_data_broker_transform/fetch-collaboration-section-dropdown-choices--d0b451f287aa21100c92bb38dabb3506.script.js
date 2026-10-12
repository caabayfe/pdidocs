function transform(input) {

    var COLLABORATE_DROPDOWN_OPTIONS = "sn_sow_collab.CollaborateDropdownOptions";
    var exPointImplementations = new GlideScriptedExtensionPoint().getExtensions(COLLABORATE_DROPDOWN_OPTIONS);
    var sectionsMap = {};
    if (exPointImplementations) {
        for (var i = 0; i < exPointImplementations.length; i++) {
            var handler = exPointImplementations[i];
            handler.initialize();
            if (typeof handler.getDropDownChoices !== 'function') {
                return;
            }
            var dropdownPayload = handler.getDropDownChoices(input.tableName, input.recordSysId);
            if (dropdownPayload.sectionId) {
                if (!sectionsMap[dropdownPayload.sectionId]) {
                    var section = {};
                    section.id = dropdownPayload.sectionId;
                    section.label = dropdownPayload.sectionLabel;
                    section.children = [];
                    sectionsMap[dropdownPayload.sectionId] = section;
                }
                sectionsMap[dropdownPayload.sectionId].children = dropdownPayload.children;
            }
        }
    }
    var collabDropdownSections = [];
    Object.keys(sectionsMap).forEach(function(section) {
        collabDropdownSections.push(sectionsMap[section]);
    });
    return collabDropdownSections;

}
