var Variant = Class.create();
Variant.prototype = {
    initialize: function() {
        // Initialize all properties to null/default values
        this.variantId = null;
        this.parentId = null; // maps to parentid
        this.parentTable = null;
        this.name = null;
        this.description = null;
        this.percentage = 0.0;
        this.value = null;
        this.defaultVariant = false;
        this.createTimestamp = null;

        // Initialize bounds for variant selection
        this.lowerBound = 0.0;
        this.upperBound = 0.0;
    },

    initializeWithGr: function(gr) {
        this.setVariantId(gr.getUniqueValue())
            .setParentId(gr.getValue('parent_id'))
            .setParentTable(gr.getValue('parent_table'))
            .setName(gr.getValue('name'))
            .setDescription(gr.getValue('description'))
            .setPercentage(gr.getValue('percentage'))
            .setValue(gr.getValue('value'))
            .setDefaultVariant(gr.getValue('default_variant'))
            .setCreateTimestamp(gr.getValue('sys_created_on'));

        // Initialize bounds for variant selection
        this.setLowerBound(0.0)
            .setUpperBound(0.0);

        return this;
    },




    /**
     * Sets the variant ID
     * @param {String} variantId - Variant identifier
     * @returns {VariantSetter} This instance for chaining
     */
    setVariantId: function(variantId) {
        this.variantId = variantId;
        return this;
    },

    /**
     * Sets the parent ID (parentid)
     * @param {String} parentId - Parent ID
     * @returns {VariantSetter} This instance for chaining
     */
    setParentId: function(parentId) {
        this.parentId = parentId;
        return this;
    },

    /**
     * Sets the parent table name
     * @param {String} parentTable - Parent table name
     * @returns {VariantSetter} This instance for chaining
     */
    setParentTable: function(parentTable) {
        this.parentTable = parentTable;
        return this;
    },

    /**
     * Sets the variant name
     * @param {String} name - Variant name
     * @returns {VariantSetter} This instance for chaining
     */
    setName: function(name) {
        this.name = name;
        return this;
    },

    /**
     * Sets the variant description
     * @param {String} description - Variant description
     * @returns {VariantSetter} This instance for chaining
     */
    setDescription: function(description) {
        this.description = description;
        return this;
    },

    /**
     * Sets the percentage allocation 
     * @param {Number} percentage 
     * @returns {VariantSetter} This instance for chaining
     */
    setPercentage: function(percentage) {
        this.percentage = parseFloat(percentage) || 0.0;
        return this;
    },

    /**
     * Sets the creation timestamp
     * @param timestamp 
     * @returns {VariantSetter} This instance for chaining
     */
    setCreateTimestamp: function(timestamp) {
        if (timestamp instanceof GlideDateTime) {
            this.createTimestamp = timestamp;
        } else if (timestamp) {
            this.createTimestamp = new GlideDateTime(timestamp);
        } else {
            this.createTimestamp = null;
        }
        return this;
    },

    /**
     * Sets the value associated with this variant
     * @param {String} value - Variant value
     * @returns {VariantSetter} This instance for chaining
     */
    setValue: function(value) {
        this.value = value;
        return this;
    },

    /**
     * Sets whether this variant is the default/control variant
     * @param {Boolean} defaultVariant - True if default
     * @returns {VariantSetter} This instance for chaining
     */
    setDefaultVariant: function(defaultVariant) {
        if (typeof defaultVariant === 'string') {
            defaultVariant = defaultVariant === '1' || defaultVariant.toLowerCase() === 'true';
        } else {
            defaultVariant = Boolean(defaultVariant);
        }
        this.defaultVariant = defaultVariant;
        return this;
    },

    /**
     * Sets the lower bound for variant selection
     * @param {Number} lowerBound - Lower bound value (0.0-1.0)
     * @returns {VariantSetter} This instance for chaining
     */
    setLowerBound: function(lowerBound) {
        this.lowerBound = lowerBound;
        return this;
    },

    /**
     * Sets the upper bound for variant selection
     * @param {Number} upperBound - Upper bound value (0.0-1.0)
     * @returns {VariantSetter} This instance for chaining
     */
    setUpperBound: function(upperBound) {
        this.upperBound = upperBound;
        return this;
    },

    /**
     * Gets the variant ID
     * @returns {String} Variant identifier
     */
    getVariantId: function() {
        return this.variantId;
    },

    /**
     * Gets the experiment ID (parentid)
     * @returns {String} Experiment system ID
     */
    getParentId: function() {
        return this.parentId;
    },

    /**
     * Gets the parent table name
     * @returns {String} Parent table of the variant
     */
    getParentTable: function() {
        return this.parentTable;
    },

    /**
     * Gets the variant name
     * @returns {String} Variant name
     */
    getName: function() {
        return this.name;
    },

    /**
     * Gets the variant description
     * @returns {String} Variant description
     */
    getDescription: function() {
        return this.description;
    },

    /**
     * Gets the percentage allocation for this variant
     * @returns {Number} Percentage value (0-100)
     */
    getPercentage: function() {
        return this.percentage;
    },

    /**
     * Gets the Value of this variant
     * @returns {Number} Percentage value (0-100)
     */
    getValue: function() {
        return this.value;
    },

    /**
     * Gets the creation timestamp for this variant
     * @returns Creation Timestamp
     */
    getCreateTimestamp: function() {
        return this.createTimestamp;
    },

    /**
     * Gets whether this is the default/control variant
     * @returns {Boolean} True if default variant
     */
    isDefaultVariant: function() {
        return this.defaultVariant;
    },

    /**
     * Gets the lower bound for variant selection
     * @returns {Number} Lower bound value (0.0-1.0)
     */
    getLowerBound: function() {
        return this.lowerBound;
    },

    /**
     * Gets the upper bound for variant selection
     * @returns {Number} Upper bound value (0.0-1.0)
     */
    getUpperBound: function() {
        return this.upperBound;
    },

    /**
     * Converts variant to JSON object for serialization
     * @returns {Object} JSON representation of variant
     */
    toJSON: function() {
        return {
            variantId: this.variantId,
            parentId: this.parentId,
            parentTable: this.parentTable,
            name: this.name,
            description: this.description,
            percentage: this.percentage,
            value: this.value,
            defaultVariant: this.defaultVariant,
            createTimestamp: this.createTimestamp,
            lowerBound: this.lowerBound,
            upperBound: this.upperBound,
        };
    },


    /**
     * Converts array of Variant instances to JSON array for serialization
     * @param {Array<Variant>} variants - Array of Variant instances to convert
     * @returns {Array} JSON array representation of variants
     */
    toJsonArray: function(variants) {
        return variants.map(variant => variant.toJSON());
    },

    type: 'Variant'
};

/**
     * Creates a Variant instance from a JSON object
     * @param {Object} json - JSON object containing variant data
     * @returns {Variant} New Variant instance
     * @static
     */
Variant.fromJSON = function(json) {
    if (!json || typeof json !== 'object') {
        throw new Error('Invalid JSON input: expected an object');
    }

    const variant = new Variant();

    // Set all properties from JSON, using null checks for optional fields
    if (json.variantId !== undefined) variant.setVariantId(json.variantId);
    if (json.parentId !== undefined) variant.setParentId(json.parentId);
    if (json.parentTable !== undefined) variant.setParentTable(json.parentTable);
    if (json.name !== undefined) variant.setName(json.name);
    if (json.description !== undefined) variant.setDescription(json.description);
    if (json.percentage !== undefined) variant.setPercentage(json.percentage);
    if (json.value !== undefined) variant.setValue(json.value);
    if (json.defaultVariant !== undefined) variant.setDefaultVariant(json.defaultVariant);
    if (json.createTimestamp !== undefined) variant.setCreateTimestamp(json.createTimestamp);
    if (json.lowerBound !== undefined) variant.setLowerBound(json.lowerBound);
    if (json.upperBound !== undefined) variant.setUpperBound(json.upperBound);

    return variant;
}
