var STTRMTemplateSNC = Class.create();
STTRMTemplateSNC.prototype = {

    CACHE_NAME: "com.snc.itsm.state_transition_model_template",
    LOG_PROPERTY: "com.snc.itsm.state_transition_model.log",
    TEMPLATE_TABLE: "sttrm_template",

    initialize: function(sttrmTemplateGrOrSysId, _gs) {
        this._gr = sttrmTemplateGrOrSysId;
        this._gs = _gs || gs;
        this._log = new GSLog(this.LOG_PROPERTY, this.type).setLog4J();

        this._cached = null;
        this._idChk = null;
    },

    /**
     * Returns the GlideRecord[Secure] representing this template.
     *
     * If the object was instanciated with a sys_id this will perform a GlideRecordSecure lookup and return the record if found.  null otherwise
	 *
     * If instanciated with a GlideRecord variant will return the provided record
     */
    getRecord: function() {
        if (typeof this._gr !== "string")
            return this._gr;

        // Lookup record if we've been given a string
        var sttrmTemplateGr = new GlideRecordSecure(this.TEMPLATE_TABLE);
        if (!sttrmTemplateGr.get(this._gr))
            return null;

        this._gr = sttrmTemplateGr;

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getRecord] valid gr: " + sttrmTemplateGr.getTableName() + ":" + sttrmTemplateGr.getUniqueValue());

        return sttrmTemplateGr;
    },

    // Caching method, used internally
    _initCache: function() {
        if (GlideCacheManager.get(this.CACHE_NAME, "_created_") !== null)
            return;

        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_getCached] initialising cache " + this.CACHE_NAME);

        GlideCacheManager.addPrivateCacheable(this.CACHE_NAME);
        GlideCacheManager.put(this.CACHE_NAME, "_created_", new GlideDateTime().getNumericValue());
    },

    // Caching method used internally
    _getCacheKey: function() {
        if (!this._gr)
            return null;

        return this._gr.getUniqueValue ? this._gr.getUniqueValue() : this._gr;
    },

    // Caching method, used internally
    _getCached: function() {
        var cacheKey = this._getCacheKey();

        if (!cacheKey) {
            this._log.debug("[_getCached] No cache key available");
            return {};
        }

        // Checks the GR hasn't moved beneath us
        if (this._cached !== null && this._idChk === cacheKey)
            return this._cached;

        this._idChk = cacheKey;
        this._cached = GlideCacheManager.get(this.CACHE_NAME, cacheKey);
        if (this._cached) {
            this._cached = JSON.parse(this._cached);
        } else {
            this._initCache();
            this._cached = {};
            this._refreshCache();
        }

        return this._cached;
    },

    // Caching method, used internally
    _refreshCache: function() {
        var cacheKey = this._getCacheKey();
        if (!cacheKey)
            return;

        GlideCacheManager.put(this.CACHE_NAME, cacheKey, JSON.stringify(this._getCached()));
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug("[_refreshCache] Cache Refreshed.  New value: " + JSON.stringify(this._getCached()));
    },

    /**
	 * Adds an key:value pair to the cache for this record
	 */
    addToCache: function(key, value) {
        this._getCached()[key] = value;
        this._refreshCache();
    },

    /**
	 * Returns a value from the cache for the provided key, or null
	 */
    getFromCache: function(key) {
        var v = this._getCached()[key];
        return typeof v !== "undefined" ? v : null;
    },

	/**
	 * Returns the GlideRecord for the model associated to this template
	 */
    getModel: function() {
        if (!this.getRecord())
            return null;

        if (!this._gr.sttrm_model.nil())
            return new STTRMModel(this._gr.sttrm_model.getRefRecord());

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getModel] no model found");

        return null;
    },

	/**
	 * Applies this template to the provided targetGr GlideRecord
	 */
	applyTemplate: function(targetGr) {
		// Check if we have a valid template record.
		if (!this.getRecord()) {
            this._log.debug("[applyTemplate] no valid template record provided");
            return false;
        }

		// Check if we have a valid target record
		if (!(targetGr instanceof GlideRecord) && !(targetGr instanceof GlideRecordSecure)) {
			this._log.debug("[applyTemplate] No target GlideRecord provided for template application");
			return false;
		}

		// Check if the template record is in the STTRM template hierarchy
		if (GlideDBObjectManager.getTables(this._gr.getTableName()).indexOf(this.TEMPLATE_TABLE) === -1) {
            if (this._log.atLevel(global.GSLog.DEBUG))
                this._log.debug("[applyTemplate] table does not extend "  + this.TEMPLATE_TABLE + ": " + this._gr.getTableName());

            return false;
        }

		// Check if the template is defined for the target table
		if (GlideDBObjectManager.getTables(this._gr.getValue("table")).indexOf(targetGr.getTableName()) === -1) {
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[applyTemplate] Template for " + this._gr.getValue("table") + " cannot be applied to " + targetGr.getTableName());

			return false;
		}

		// Check if the template is published
        if (!this.isPublished()) {
            if (this._log.atLevel(global.GSLog.DEBUG))
                this._log.debug("[applyTemplate] Template state must be published or pending_retirement but is: " + this.getRecord().getValue("state"));

            return false;
        }

		// This gives me the list of fields to check for changes in the targetGr and to restore aftyer the template is applied.
		var templateFields = this.getTemplateFields();
		var readOnlyFields = this.getFieldPolicies().readOnlyFieldPolicies;

		var fieldsToCheck = templateFields.filter(function(field) {
			return readOnlyFields.indexOf(field) === -1;
		});

		var setValues = {};
		fieldsToCheck.forEach(function(field) {
			if (targetGr[field] && targetGr[field].changes())
				setValues[field] = targetGr.getValue(field);
		});
		
		// Apply the template
		GlideTemplate.getFromRecord(this._gr).apply(targetGr);

		// Reset any overwritten values
		Object.keys(setValues).forEach(function(field){
			targetGr.setValue(field, setValues[field]);
		});

		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[applyTemplate] Template " + this._gr.getValue("name") + " applied to " + targetGr.getDisplayValue());

		return true;
	},

	/**
	 * Returns the template as a set of name value pairs
	 */
    getTemplateValues: function() {
        if (this._gr.record_preset.nil())
            return {};

        var targetGr = new GlideRecord(this._gr.getValue("table"));
        targetGr.initialize();
        if (GlideTemplate.getFromRecord(this._gr).apply(targetGr) !== 0)
            return {};

        var nvp = {};
		var templateFields = this.getTemplateFields();
		templateFields.forEach(function(field) {
			var vals = {};
            vals.value = targetGr.getValue(field);
            vals.displayValue = targetGr.getDisplayValue(field);
            nvp[field] = vals;
		});

        return nvp;
    },

	/**
	 * Returns the list of fields defined in the template
	 */
	getTemplateFields: function() {
		if (!this.getRecord() || this._gr.template.nil())
            return [];

		var fields = this.getFromCache("template_fields");
		if (fields !== null)
			return fields;

		fields = [];
        var encoded = this._gr.getValue("template");
        var elements = encoded.split("^");
        elements.forEach(function(element) {
            if (element === "EQ")
                return;
            var pair = element.split("=");
			fields.push(pair[0]);
        });

		this.addToCache("template_fields", fields);
		return fields;
	},

	// Returns true if this template is published
	isPublished: function() {
		var templateGr = this.getRecord();
		if (templateGr == null)
			return false;

		return ["published", "pending_retirement"].indexOf(templateGr.getValue("state")) !== -1;
	},

	/**
	 * Returns the field policies for this template
	 * 
	 * Structure:
	 * {
	 *     hasFieldPolicies: boolean,
	 * 	   mandatoryFieldPolicies: [array of field names],
	 * 	   readOnlyFieldPolicies: [array of field names]
	 * }
	 */
    getFieldPolicies: function() {
        var cachedFieldPolicies = this.getFromCache("field_policies");
        if (cachedFieldPolicies !== null)
            return cachedFieldPolicies;

        var fieldPolicies = {
            hasFieldPolicies: false,
            mandatoryFieldPolicies: [],
            readOnlyFieldPolicies: []
        };

        if (!this.getRecord()) {
            this.addToCache("field_policies", fieldPolicies);
            return fieldPolicies;
        }

        var fieldPoliciesGr = new GlideRecord("sttrm_template_field_policy");
        fieldPoliciesGr.addQuery("sttrm_base_template", this._gr.getUniqueValue());
        fieldPoliciesGr.addActiveQuery();
        fieldPoliciesGr.query();
        fieldPolicies.hasFieldPolicies = fieldPoliciesGr.hasNext();

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getFieldPolicies] has field policies: " + fieldPolicies.hasFieldPolicies);

        while (fieldPoliciesGr.next()) {
            var fieldName = fieldPoliciesGr.getValue("name");

            if (global.JSUtil.getBooleanValue(fieldPoliciesGr, "mandatory"))
                fieldPolicies.mandatoryFieldPolicies.push(fieldName);

            if (global.JSUtil.getBooleanValue(fieldPoliciesGr, "read_only"))
                fieldPolicies.readOnlyFieldPolicies.push(fieldName);
        }

        if (this._log.atLevel(global.GSLog.DEBUG))
            this._log.debug("[getFieldPolicies] field policies: " + JSON.stringify(fieldPolicies));

        this.addToCache("field_policies", fieldPolicies);
        return fieldPolicies;
    },

    type: "STTRMTemplateSNC"
};

STTRMTemplateSNC.clearCache = function() {
    GlideCacheManager.flush(STTRMTemplateSNC.prototype.CACHE_NAME);
};
