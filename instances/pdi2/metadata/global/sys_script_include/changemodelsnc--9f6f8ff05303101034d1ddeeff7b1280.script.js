var ChangeModelSNC = Class.create();
ChangeModelSNC.prototype = Object.extendsObject(STTRMModel, {

    IMPLEMENTATION_STATES: "implementation_states",

    initialize: function(modelGr, _gs) {
        STTRMModel.prototype.initialize.call(this, modelGr, _gs);
    },

    // Applies a change model to a Change Request
    applyModel: function(changeRequestGr) {
        changeRequestGr.setValue("chg_model", this._gr.getUniqueValue());
        this.applyRecordPresets(changeRequestGr);
        this.applyInitialState(changeRequestGr, changeRequestGr.chg_model.changes());
    },

    // Applies the record presets defined in the model to the Change Request
    applyRecordPresets: function(changeRequestGr) {
        if (!changeRequestGr || !this.applyRecordPreset())
            return;

        var recordPreset = this._gr.getValue("record_preset");

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[applyRecordPresets] recordPreset: " + recordPreset);

        if (recordPreset)
            changeRequestGr.applyEncodedQuery(recordPreset);
    },

    applyRecordPreset: function() {
        var validGr = !!this._gr;

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[applyRecordPreset] validGr: " + validGr);

        if (!validGr)
            return false;

        // New boolean field can be true/false or null
        if (this._applyRecordPresetValue())
            return true;

        // record preset exists and apply record preset is true
        var applyPreset = !!(this._gr.record_preset && !this._gr.record_preset.nil() && this._gr.apply_record_preset);

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[applyRecordPreset] applyPreset: " + applyPreset);

        return applyPreset;
    },

    _applyRecordPresetValue: function() {
        var applyRecordPresetValue = !!(!this._gr.isValidField("apply_record_preset") || this._gr.apply_record_preset.nil());
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[applyRecordPreset] applyRecordPresetValue: " + applyRecordPresetValue);

        return applyRecordPresetValue;
    },

    getRecordPresetValues: function() {
        if (this._gr.record_preset.nil())
            return {};

        var templateGR = new GlideRecord("sys_template");
        templateGR.initialize();
        templateGR.setValue("template", this._gr.getValue("record_preset"));
        templateGR.setValue("table", this._gr.getValue("table_name"));
        var changeGR = new GlideRecord(this._gr.getValue("table_name"));
        changeGR.initialize();
        if (GlideTemplate.getFromRecord(templateGR).apply(changeGR) !== 0)
            return {};

        var nvp = {};
		var presetFields = this.getRecordPresetFields();
		presetFields.forEach(function(field){
			var vals = {};
            vals.value = changeGR.getValue(field);
            vals.displayValue = changeGR.getDisplayValue(field);
            nvp[field] = vals;
		});

        return nvp;
    },

	/**
	 * Returns the list of fields defined in the preset
	 */
	getRecordPresetFields: function() {
		if (this._gr.record_preset.nil())
            return [];

		var fields = this.getFromCache("record_preset_fields");
		if (fields !== null)
			return fields;

		fields = [];
        var encoded = this._gr.getValue("record_preset");
        var elements = encoded.split("^");
        elements.forEach(function(element) {
            if (element === "EQ")
                return;
            var pair = element.split("=");
			fields.push(pair[0]);
        });

		this.addToCache("record_preset_fields", fields);
		return fields;
	},

    // Returns an array of implementation state values defined for this model
    getImplementationStates: function() {
        var implementationStates = this.getFromCache(this.IMPLEMENTATION_STATES);

        if (implementationStates !== null)
            return implementationStates;

        implementationStates = [];

        // Check all states for attribute and combine with implementation states
        var implementationStatesIds = this._gr[this.IMPLEMENTATION_STATES].nil() ? [] : this._gr.getValue(this.IMPLEMENTATION_STATES).split(",");

        var statesGr = this.getStates();
        while (statesGr.next()) {
            if (implementationStatesIds.indexOf(statesGr.getUniqueValue()) !== -1 || this.hasStateAttribute(statesGr, "allow_implementation"))
                implementationStates.push(statesGr.getValue("state_value"));
        }

        this.addToCache(this.IMPLEMENTATION_STATES, implementationStates);
        return implementationStates;
    },

    // Overridden from the base STTRMModel class to accommodate specific state attribute behaviours
    getStateAttributesValues: function(processGrOrStateValue) {
        if (!processGrOrStateValue)
            return null;

        var cachedStateAttributes = this.getFromCache("state_attributes") || {};
        var stateValue = this.getStateValue(processGrOrStateValue);

        if (typeof cachedStateAttributes[stateValue] !== "undefined")
            return cachedStateAttributes[stateValue];

        var stateGr = this.getState(processGrOrStateValue);
        if (stateGr === null)
            return [];

        // This call will cache the defined attributes for the state.  We‘ll need to modify those values and update the cache
        var stateAttributes = STTRMModel.prototype.getStateAttributesValues.call(this, stateGr);

        // Add in allow_implementation if it's an implementation state
        var implementationStates = this.getImplementationStates();
        stateValue = this.getStateValue(stateGr);
        if (implementationStates.indexOf(stateValue) !== -1 && stateAttributes.indexOf("allow_implementation") === -1) {
            stateAttributes.push("allow_implementation");
        }

        cachedStateAttributes[stateValue] = stateAttributes;
        this.addToCache("state_attributes", cachedStateAttributes);

        return stateAttributes;
    },

    type: "ChangeModelSNC"
});

ChangeModelSNC.getDefaultReadRoles = function() {
    var defaultReadRoles = (gs.getProperty("com.snc.change_management.change_model.default_read_roles") + "").split(",");
    if (!Array.isArray(defaultReadRoles) || defaultReadRoles.length < 1)
        return "";

    var validRoles = [];

    var gr = new GlideRecord("sys_user_role");
    gr.addQuery("name", "IN", defaultReadRoles);
    gr.query();
    while (gr.next())
        validRoles.push(gr.getValue("name") + "");

    return validRoles.join(",");
};

ChangeModelSNC.getRefQualForChangeRequest = function(changeRequestGr) {
    var refQual = "active=true^available_in_ui=true^table_name=" + changeRequestGr.getTableName();
    if (changeRequestGr.chg_model.nil())
        return refQual + "^EQ";

    return refQual + "^NQsys_id=" + changeRequestGr.getValue("chg_model") + "^EQ";
};

ChangeModelSNC.getDefaultModelValue = function(changeRequestGr) {
    var tableName = changeRequestGr ? changeRequestGr.getTableName() : "change_request";

    // For the Change Request table we want to preserve type compatibility functionality if the property is set.
    // For extensions we don't need to preserve this, either there's a model or leave blank.
    if (tableName === "change_request") {
        var typeCompatibility = gs.getProperty(ChangeRequestSNC.TYPE_COMPATIBILITY, "false") === "true";
        if (typeCompatibility)
            return "";
    }

    var chgModelGr = new GlideRecord("chg_model");
    chgModelGr.addActiveQuery();
    chgModelGr.addQuery("default_change_model", "1");
    chgModelGr.addQuery("table_name", tableName);
    chgModelGr.setLimit(1);
    chgModelGr.query();
    if (chgModelGr.next())
        return chgModelGr.getUniqueValue();
    return "";
};

ChangeModelSNC.getDefaultTypeValue = function() {
    var typeCompatibility = gs.getProperty(ChangeRequestSNC.TYPE_COMPATIBILITY, "false") === "true";
    return (typeCompatibility) ? "normal" : "";
};

ChangeModelSNC.getModel = function(chgModelSysId) {
    var chgModelGr = new GlideRecordSecure("chg_model");
    return (chgModelGr.get(chgModelSysId)) ? new ChangeModel(chgModelGr) : null;
};
