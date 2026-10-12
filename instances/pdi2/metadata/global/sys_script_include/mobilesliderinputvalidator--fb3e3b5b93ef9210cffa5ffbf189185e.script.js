var MobileSliderInputValidator = Class.create();
MobileSliderInputValidator.prototype = {
    initialize: function(inputId) {
        this.inputId = inputId;
        this.attributes = this._getInputAttributes();
    },

    isSliderInput: function() {
        return "slider" == this.attributes["RenderType"];
    },

    isValidSliderWithErrorMessages: function() {
        if (!this._hasRequiredFieldsWithErrorMessage())
            return false;
        var min = parseFloat(this.attributes["Min"]);
        var max = parseFloat(this.attributes["Max"]);
        var stepSize = parseFloat(this.attributes["StepSize"]);
        var sliderSize = Math.abs(max - min);
        if (min >= max) {
            gs.addErrorMessage(gs.getMessage("Min value ({0}) must be smaller than the Max value ({1}).", [min, max]));
            return false;
        }
        if (stepSize <= 0) {
            gs.addErrorMessage(gs.getMessage("StepSize ({0}) must be greater than zero.", stepSize));
            return false;
        }
        var isStepMultple = this._isStepMultiple(sliderSize, stepSize);
        if (!isStepMultple) {
            gs.addErrorMessage(gs.getMessage("The difference between Max and Min must be a multiple of StepSize."));
            return false;
        }
        if (!this._isInsideRange("DefaultValue", min, max, stepSize))
            return false;
        if (!this._isInsideRange("ReferencePoint", min, max, stepSize))
            return false;
        if (!this._decorationIsValid(min, max))
            return false;

        return true;
    },

    _getInputAttributes: function() {
        var attributesGr = new GlideRecord("sys_sg_input_attribute");
        attributesGr.addQuery("input", this.inputId);
        attributesGr.query();
        var attributes = {};
        while (attributesGr.next()) {
            var value = attributesGr.getValue("value");
            var name = attributesGr.getValue("name");
            attributes[name] = value;
        }
        return attributes;
    },

    _hasRequiredFieldsWithErrorMessage: function() {
        return this._requiredAttributeExists("Min") &&
            this._requiredAttributeExists("Max") &&
            this._requiredAttributeExists("StepSize");
    },

    _attributeExists: function(attribute) {
        return this.attributes[attribute] != undefined;
    },

    _requiredAttributeExists: function(attribute) {
        var value = this._attributeExists(attribute);
        if (!value)
            gs.addErrorMessage(gs.getMessage("Required attribute {0} is missing in Input Slider sys_id={1}", [attribute, this.inputId]));
        return value;
    },

    _isInsideRange: function(attribute, min, max, stepSize) {
        if (!this._attributeExists(attribute))
            return true;
        var value = parseFloat(this.attributes[attribute]);
        if (!(min <= value && value <= max)) {
            gs.addErrorMessage(gs.getMessage("{0} ({1}) is outside of the range between Min ({2}) and Max ({3}).", [attribute, value, min, max]));
            return false;
        }
        var isEnforceStepSize = this._attributeExists("EnforceStepSize") && this.attributes["EnforceStepSize"] === "true";
        if (isEnforceStepSize && !this._isStepMultiple(Math.abs(value - min), stepSize)) {
            gs.addErrorMessage(gs.getMessage("When EnforceStepSize is enabled, the {0} should be on a step, defined by StepSize.", [attribute]));
            return false;
        }
        return true;
    },

    _isStepMultiple: function(sliderSize, stepSize) {
        var stepsRemainders = sliderSize % stepSize;
        var epsilon = 0.0000001; // dealing with floating point precision
        return Math.abs(stepsRemainders) <= epsilon || Math.abs(stepsRemainders - stepSize) <= epsilon;
    },

    _decorationIsValid: function(min, max) {
        if (!this._attributeExists("Decoration"))
            return true;
        var decoration = JSON.parse(this.attributes["Decoration"]);
        var ranges = decoration["Range"];
        if (!ranges)
            return true;
        var MAX_NUMBER_OF_RANGES = 8;
        if (ranges.length > MAX_NUMBER_OF_RANGES) {
            gs.addErrorMessage(gs.getMessage("A Slider can have a maximum of {0} range's decorations. Please remove excess range's decorations.", MAX_NUMBER_OF_RANGES));
            return false;
        }
        ranges.sort(function(a, b) { return parseFloat(a["StartValue"]) - parseFloat(b["StartValue"]);});
        var previousEnd = min;
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (range["StartValue"] == undefined || range["EndValue"] == undefined || range["Label"] == undefined || range["Color"] == undefined) {
                gs.addErrorMessage(gs.getMessage("Range's decoration should have the required attributes: StartValue, EndValue, Label, Color."));
                return false;
            }
            var start = parseFloat(range["StartValue"]);
            var end = parseFloat(range["EndValue"]);
            if (start >= end) {
                gs.addErrorMessage(gs.getMessage("The StartValue of a range must be less than the EndValue of that range."));
                return false;
            }
            if (start != previousEnd) {
                gs.addErrorMessage(gs.getMessage("Range's decorations must be sequential with the previous range's decoration EndValue equals the current range's decoration StartValue."));
                return false;
            }
            previousEnd = end;
        }
        if (previousEnd != max) {
            gs.addErrorMessage(gs.getMessage("Range's decorations must be sequential with the EndValue of the last range's decoration equaling the defined Max slider input value."));
            return false;
        }
        return true;
    },

    type: 'MobileSliderInputValidator'
};
