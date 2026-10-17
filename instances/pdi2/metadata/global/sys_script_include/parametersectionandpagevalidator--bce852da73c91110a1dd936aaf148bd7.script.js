var ParameterSectionAndPageValidator = Class.create();
ParameterSectionAndPageValidator.prototype = {
    initialize: function(current) {
        this.current = current;
    },

    getSectionAttributesGR: function(sectionSysId) {
        var sectionAttributesGR = new GlideRecord('sys_sg_section_attribute');
        sectionAttributesGR.addQuery('section', sectionSysId);
        sectionAttributesGR.query();
        return sectionAttributesGR;
    },

    getInputsGR: function(fieldName, value) {
        var inputsGR = new GlideRecord('sys_sg_input');
        inputsGR.addQuery(fieldName, value);
        inputsGR.query();
        return inputsGR;
    },

    isBarcodeSection: function(sectionSysId) {
        var sectionAttributesGR = this.getSectionAttributesGR(sectionSysId);
        while (sectionAttributesGR.next()) {
            var name = sectionAttributesGR.getValue('name');
            var value = sectionAttributesGR.getValue('value');
            if (name === "SectionType" && value === "barcode")
                return true;
        }
        return false;
    },

    hasNonBarcodeInputs: function() {
        var inputsGR = this.getInputsGR('parameter_section', this.current.section);
        while (inputsGR.next()) {
            var inputType = inputsGR.getDisplayValue('type');
            if (inputType !== "Barcode")
                return true;
        }
        return false;

    },

    isValidInputForSection: function() {
        var barcodeSection = this.isBarcodeSection(this.current.parameter_section);
        if (barcodeSection) {
            gs.addErrorMessage(gs.getMessage("Invalid input for Barcode Section. A barcode section can only have barcode input."));
            return false;
        }
        return true;
    },

    isValidSectionAttribute: function() {
        var hasNonBarcodeInputs = this.hasNonBarcodeInputs();
        if (hasNonBarcodeInputs) {
            gs.addErrorMessage(gs.getMessage("Invalid input for Barcode Section. A barcode section can only have barcode input."));
            return false;
        }
        return true;
    },

    type: 'ParameterSectionAndPageValidator'
};
