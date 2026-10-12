var Experiment = Class.create();
Experiment.prototype = {
    initialize: function() {
        // Initialize all properties to null/default values
        this.sysId = null;
        this.name = null;
        this.description = null;
        this.startDate = null;
        this.stickiness = null;
        this.status = null;
        this.key = null;
        this.instanceType = null;
        this.optOut = false;
        this.category = null;
        this.segment = null;
        this.featureFlag = null;
        this.isGA = false;
    },

    initializeWithGr: function(gr) {
        this.setSysId(gr.getUniqueValue())
            .setName(gr.getValue("name"))
            .setDescription(gr.getValue("description"))
            .setStickiness(gr.getValue("stickiness"))
            .setStatus(gr.getValue("status"))
            .setKey(gr.getValue("key"))
            .setInstanceType(gr.getValue("instance_type"))
            .setOptOut(gr.getValue("opt_out"))
            .setCategory(gr.getValue("category"))
            .setSegment(gr.getValue("segment"))
            .setFeatureFlag(gr.getValue("feature_flag"))
            .setIsGA(gr.getValue("is_ga"))

        if (gr.start_time && !gr.start_time.nil()) {
            this.setStartDate(gr.start_time.getGlideObject());
        }

        return this;
    },


    /**
     * Sets the system ID
     * @param {String} sysId
     * @returns {Experiment}
     */
    setSysId: function(sysId) {
        this.sysId = sysId;
        return this;
    },

    /**
     * Sets the experiment name
     * @param {String} name - Experiment name
     * @returns {Experiment} This instance for chaining
     */
    setName: function(name) {
        this.name = name;
        return this;
    },

    /**
     * Sets the experiment description
     * @param {String} description - Experiment description
     * @returns {Experiment} This instance for chaining
     */
    setDescription: function(description) {
        this.description = description;
        return this;
    },

    /**
     * Sets the start date
     * @param {GlideDateTime|String|Date} startDate - Experiment start date
     * @returns {Experiment} This instance for chaining
     */
    setStartDate: function(startDate) {
        this.startDate = this.convertTimestamp(startDate);
        return this;
    },

    /**
     * Sets the stickiness
     * @param {String} stickiness - Experiment stickiness configuration
     * @returns {Experiment} This instance for chaining
     */
    setStickiness: function(stickiness) {
        this.stickiness = stickiness;
        return this;
    },

    /**
     * Sets the experiment status
     * @param {String} status - Experiment status
     * @returns {Experiment} This instance for chaining
     */
    setStatus: function(status) {
        this.status = status;
        return this;
    },

    /**
     * Sets the experiment key
     * @param {String} key - Experiment key configuration
     * @returns {Experiment} This instance for chaining
     */
    setKey: function(key) {
        this.key = key;
        return this;
    },

    /**
     * Sets the instance type
     * @param {String} instanceType - Instance type configuration
     * @returns {Experiment} This instance for chaining
     */
    setInstanceType: function(instanceType) {
        this.instanceType = instanceType;
        return this;
    },

    /**
     * Sets the opt-out flag
     * @param {Boolean} optOut - Whether experiment allows opt-out
     * @returns {Experiment} This instance for chaining
     */
    setOptOut: function(optOut) {
        if (typeof optOut === 'string') {
            optOut = optOut === '1' || optOut.toLowerCase() === 'true';
        } else {
            optOut = Boolean(optOut);
        }
        this.optOut = optOut;
        return this;
    },

    /**
     * Sets the category
     * @param {String} category
     * @returns {Experiment}
     */
    setCategory: function(category) {
        this.category = category;
        return this;
    },

    /**
     * Sets the segment reference
     * @param {String} segment
     * @returns {Experiment}
     */
    setSegment: function(segment) {
        this.segment = segment;
        return this;
    },

    /**
     * Sets the feature flag reference
     * @param {String} featureFlag
     * @returns {Experiment}
     */
    setFeatureFlag: function(featureFlag) {
        this.featureFlag = featureFlag;
        return this;
    },

    /**
     * Sets the General Availability flag
     * @param {Boolean|String} isGA - Whether the experiment is generally available
     * @returns {Experiment} This instance for chaining
     */
    setIsGA: function(isGA) {
        if (typeof isGA === 'string') {
            isGA = isGA === '1' || isGA.toLowerCase() === 'true';
        } else {
            isGA = Boolean(isGA);
        }
        this.isGA = isGA;
        return this;
    },

    /**
     * Converts various timestamp formats to GlideDateTime
     * @private
     * @param {GlideDateTime|String|Date} timestamp
     * @returns {GlideDateTime|null}
     */
    convertTimestamp: function(timestamp) {
        if (typeof timestamp === 'string') {
            return new GlideDateTime(timestamp);
        } else if (timestamp instanceof Date) {
            var gdt = new GlideDateTime();
            gdt.setDisplayValue(timestamp.toISOString());
            return gdt;
        } else {
            // Assume it's already a GlideDateTime
            return timestamp;
        }
    },

    /**
     * Gets the system ID (sysid)
     * @returns {String|null}
     */
    getSysId: function() {
        return this.sysId;
    },

    /**
     * Gets the experiment name
     * @returns {String} Experiment name
     */
    getName: function() {
        return this.name;
    },

    /**
     * Gets the experiment description
     * @returns {String} Experiment description
     */
    getDescription: function() {
        return this.description;
    },

    /**
     * Gets the start date
     * @returns {GlideDateTime} Experiment start date
     */
    getStartDate: function() {
        return this.startDate;
    },

    /**
     * Gets the stickiness configuration
     * @returns {String} Experiment stickiness
     */
    getStickiness: function() {
        return this.stickiness;
    },

    /**
     * Gets the experiment status
     * @returns {String} Experiment status
     */
    getStatus: function() {
        return this.status;
    },

    /**
     * Gets the experiment key (maps to key)
     * @returns {String|null}
     */
    getKey: function() {
        return this.key;
    },

    /**
     * Gets the instance type
     * @returns {String} Instance type configuration
     */
    getInstanceType: function() {
        return this.instanceType;
    },

    /**
     * Gets the opt-out flag
     * @returns {Boolean} Whether experiment allows opt-out
     */
    isOptOut: function() {
        return this.optOut;
    },

    /**
     * Gets the category
     * @returns {String|null}
     */
    getCategory: function() {
        return this.category;
    },

    /**
     * Gets the segment reference sysid
     * @returns {String|null}
     */
    getSegment: function() {
        return this.segment;
    },

    /**
     * Gets the feature flag reference sysid
     * @returns {String|null}
     */
    getFeatureFlag: function() {
        return this.featureFlag;
    },

    /**
     * Gets the General Availability flag
     * @returns {Boolean} Whether the experiment is generally available
     */
    getIsGA: function() {
        return this.isGA;
    },

    getVariantParentId: function() {
        return this.getSysId();
    },

    /**
     * Converts experiment to JSON object for serialization
     * @returns {Object}
     */
    toJSON: function() {
        return {
            sysId: this.sysId,
            name: this.name,
            description: this.description,
            startDate: this.startDate ? this.startDate.toString() : null,
            stickiness: this.stickiness,
            status: this.status,
            key: this.key,
            instanceType: this.instanceType,
            optOut: this.optOut,
            category: this.category,
            segment: this.segment,
            featureFlag: this.featureFlag,
            isGA: this.isGA
        };
    },

    type: 'Experiment'
};

/**
     * Creates an Experiment instance from a JSON object
     * @param {Object} json - JSON object containing experiment data
     * @returns {Experiment} New Experiment instance
     * @static
     */
Experiment.fromJSON = function(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid JSON input: expected an object');
    }

    var experiment = new Experiment();

    if (json.sysId !== undefined) experiment.setSysId(json.sysId);
    if (json.name !== undefined) experiment.setName(json.name);
    if (json.description !== undefined) experiment.setDescription(json.description);
    if (json.startDate !== undefined && json.startDate !== null) experiment.setStartDate(json.startDate);
    if (json.stickiness !== undefined) experiment.setStickiness(json.stickiness);
    if (json.status !== undefined) experiment.setStatus(json.status);
    if (json.key !== undefined) experiment.setKey(json.key);
    if (json.instanceType !== undefined) experiment.setInstanceType(json.instanceType);
    if (json.optOut !== undefined) experiment.setOptOut(json.optOut);
    if (json.category !== undefined) experiment.setCategory(json.category);  
    if (json.segment !== undefined) experiment.setSegment(json.segment);
    if (json.featureFlag !== undefined) experiment.setFeatureFlag(json.featureFlag);
    if (json.isGA !== undefined) experiment.setIsGA(json.isGA);

    return experiment;
}
