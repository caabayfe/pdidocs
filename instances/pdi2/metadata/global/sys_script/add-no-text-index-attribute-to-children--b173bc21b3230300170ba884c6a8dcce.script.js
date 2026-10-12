(function executeRule(current, previous) {
    var NO_TEXT_INDEX = 'no_text_index';
    var dbObjectManager = GlideDBObjectManager.get();
    var currentAttributes = new GlideAttributes(current.attributes);
    var parentTable = dbObjectManager.getBase(current.name);
    if (parentTable !== current.name) {
        var parentTableDescriptor = GlideTableDescriptor.get(parentTable);
        if (parentTableDescriptor != null && parentTableDescriptor.isValid()) {
            var ed = parentTableDescriptor.getED();
            if (ed != null && ed.getBooleanAttribute(NO_TEXT_INDEX)) {
                if ("true" !== currentAttributes.getAttribute(NO_TEXT_INDEX)) {
                    currentAttributes.setAttribute(NO_TEXT_INDEX, "true");
                    current.attributes = currentAttributes.serializeAttributes();
                }
            }
        }
    }

    var previousAttributes = new GlideAttributes(previous.attributes);
    var previousVal = previousAttributes.getAttribute(NO_TEXT_INDEX);
    var currentVal = currentAttributes.getAttribute(NO_TEXT_INDEX);

    if (previousVal == currentVal)
        return;

    if (!gs.nil(currentVal)) {
        var abortMessage;

        if (dbObjectManager.isSoloClass(current.name))
            abortMessage = "no_text_index attribute should Not be added to solo table. Please use text index instead.";

        else if (dbObjectManager.isBaseClass(current.name))
            abortMessage = "no_text_index attribute should Not be added to root table. Please use text index instead.";

        else if (!new GlideTSUtil().hasTextIndex(current.name))
            abortMessage = "no_text_index attribute should Not be added to a table without text index enabled.";
        if (!gs.nil(abortMessage)) {
            gs.addErrorMessage(abortMessage);
            current.setAbortAction(true);
            return;
        }
    }


    var childTableNames = dbObjectManager.getTableExtensions(current.name);
    if (childTableNames == null || childTableNames.size() == 0)
        return;

    var shouldRemoveNoTextIndexAttribute = gs.nil(currentVal) && previousVal;
    var message = (shouldRemoveNoTextIndexAttribute ? 'Removing' : 'Updating') + ' no_text_index attribute on all child tables';
    gs.addInfoMessage(message);
    gs.info(message);

    var um = new GlideUpdateManager2();
    var childTableEntries = new GlideRecord('sys_dictionary');
    childTableEntries.addQuery('name', childTableNames);
    childTableEntries.addQuery('element', '');
    childTableEntries.query();
    while (childTableEntries.next()) {
        var currentDBAttributes = new GlideAttributes(childTableEntries.attributes);
        var updatedAttributes = new GlideAttributes(childTableEntries.attributes);
        if (shouldRemoveNoTextIndexAttribute)
            updatedAttributes.removeAttribute(NO_TEXT_INDEX);
        else
            updatedAttributes.setAttribute(NO_TEXT_INDEX, currentVal);

        var currentAttributesSerialized = currentDBAttributes.serializeAttributes();
        var updatedAttributesSerialized = updatedAttributes.serializeAttributes();
        if (currentAttributesSerialized !== updatedAttributesSerialized) {
            childTableEntries.setValue("attributes", updatedAttributesSerialized);
            childTableEntries.setWorkflow(false);
            childTableEntries.updateLazy();
            um.saveRecord(childTableEntries);
        }
    }
})(current, previous);
