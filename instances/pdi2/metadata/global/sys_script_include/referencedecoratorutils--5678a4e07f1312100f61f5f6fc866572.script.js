var ReferenceDecoratorUtils = Class.create();

function canReadTable(gr) {
    // isValid !== isValidRecord
    // isValid returns true if is valid table but empty record 
    if (!gr.isValid()) {
        return false;
    }

    var resourcePath = "record/" + gr.getTableName() + "/read";
    return GlideSecurityManager.get().hasRightsTo(resourcePath, null);
}

ReferenceDecoratorUtils.prototype = {
    initialize: function() {},
    checkAttributeOverride: function(element) {
        var displayReferenceIcon = false;
        if (element.getED().isReadOnly()) {

            var readOnlyClickThrough = element.getAttribute("readonly_clickthrough");
            if (readOnlyClickThrough == "true") {
                displayReferenceIcon = true;
            } else if (readOnlyClickThrough == "false") {
                displayReferenceIcon = false;
            } else {
                displayReferenceIcon = gs.getProperty("glide.ui.reference.readonly.clickthrough") != "false";
            }

        } else {
            displayReferenceIcon = element.getAttribute("ref_decoration_disabled") != "true";
        }

        return displayReferenceIcon;
    },
    canReadRefRecord: function(element) {
        var elementType = element.getED().getInternalType();
        var grRef = null;

        if (elementType == "com.glide.vars2.Variable") {
            var question = element.getQuestion();
            var referenceTable = question.getReference();
            var referenceValue = question.getValue();
            grRef = new GlideRecord(referenceTable);
            grRef.get(referenceValue);

        } else {
            grRef = element.getRefRecord();
        }

        // DEF0758099 - Check table read ACL if empty record
        if (!grRef.isValidRecord()) {
            return canReadTable(grRef);
        }

        return grRef.canRead();
    },
    showRefDecorator: function(element) {
        return this.checkAttributeOverride(element) && this.canReadRefRecord(element);
    },
    type: 'ReferenceDecoratorUtils'
};
