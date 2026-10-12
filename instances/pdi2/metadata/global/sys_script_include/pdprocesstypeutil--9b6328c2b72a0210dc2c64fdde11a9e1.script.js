var PDProcessTypeUtil = Class.create();
PDProcessTypeUtil.prototype = {
    initialize: function() {
        this._featureTypes = null;
        // Cache standard values separately by convertToBoolean to avoid data structure mismatches
        // (true = primitives like true/false, false = objects like {value: '1'})
        this._standardValuesCache = {};
    },
    type: 'PDProcessTypeUtil',
    getProcessTypeValues: function(sysid, convertToBoolean) {
        var processTypeSysid = sysid || PADConstants.STANDARD_PROCESS_TYPE_SYS_ID;
        var values = {};

        // Step 1: Load default values from STANDARD_PROCESS_TYPE (with caching by convertToBoolean)
        // Use convertToBoolean as cache key since it changes the data structure:
        // true: boolean fields become primitives (e.g., enable_activate = true)
        // false: all fields become objects (e.g., enable_activate = {value: '1'})
        var cacheKey = convertToBoolean ? 'true' : 'false';
        if (!this._standardValuesCache[cacheKey]) {
            this._standardValuesCache[cacheKey] = this._loadProcessTypeFeatures(
                PADConstants.STANDARD_PROCESS_TYPE_SYS_ID,
                convertToBoolean
            );
        }

        // Initialize values with defaults
        values = this._standardValuesCache[cacheKey];

        // Step 2: If requesting a different process type, overlay its values
        if (processTypeSysid !== PADConstants.STANDARD_PROCESS_TYPE_SYS_ID) {
            var customValues = this._loadProcessTypeFeatures(
                processTypeSysid,
                convertToBoolean
            );

            // If we couldn't load the requested process type, throw an error
            if (!customValues) {
                throw gs.getMessage(
                    'process type with id {0} not found',
                    processTypeSysid
                );
            }

            // Overlay custom values on top of defaults (only if they are not null/empty)
            var self = this;
            PDConstants.PROCESS_TYPE_FEATURE_NAMES.forEach(function(column) {
                var customValue = customValues[column];
                var isEmpty = self._isEmptyValue(customValue);

                if (isEmpty) {
                    customValues[column] = values[column];
                }
            });

            return customValues;
        }

        return values;
    },

    /**
     * Check if a value is considered empty (should use default)
     * @param {*} value - The value to check
     * @returns {Boolean} True if the value is empty
     * @private
     */
    _isEmptyValue: function(value) {
        // For objects (which have .value property from PDUtils.getFieldReturnValue)
        // Note: Check for null first since typeof null === 'object' in JavaScript
        if (value !== null && typeof value === 'object') {
            // Empty if .value is null, undefined, or empty string
            // But NOT empty if .value is false or 0 (valid values)
            return JSUtil.nil(value.value);
        }

        // For primitives: null, undefined, or empty string is empty
        // But false and 0 are valid values
        return JSUtil.nil(value);
    },

    /**
     * Internal helper method to load process type features from a specific process type record
     * @param {String} processTypeSysid - The sys_id of the process type record
     * @param {Boolean} convertToBoolean - Whether to convert '0'/'1' strings to boolean values
     * @returns {Object|null} Object containing feature values, or null if record not found/readable
     * @private
     */
    _loadProcessTypeFeatures: function(processTypeSysid, convertToBoolean) {
        // Validate input
        if (!processTypeSysid) {
            return null;
        }

        var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_TYPE);

        // Check if record exists
        if (!gr.get(processTypeSysid)) {
            return null;
        }

        var values = {};
        values.sys_id = PDUtils.getFieldReturnValue(gr, PDConstants.FIELDS.SYS_ID);
        values.name = PDUtils.getFieldReturnValue(gr, PDConstants.FIELDS.NAME);
        var featureInternalTypes = this._getFeatureTypes();

        // Safely extract all feature values
        PDConstants.PROCESS_TYPE_FEATURE_NAMES.forEach(function(column) {
            // Guard against missing or invalid column
            if (!column) {
                return;
            }

            // Handle boolean conversion for '0' and '1' string values.
            // Preserve null so getProcessTypeValues' overlay falls back to the
            // standard process type value rather than coercing null to false.
            if (convertToBoolean && featureInternalTypes[column] === 'boolean') {
                var rawValue = gr.getValue(column);
                values[column] = JSUtil.nil(rawValue) ?
                    null :
                    JSUtil.getBooleanValue(gr, column);
            } else {
                // Store the raw value (could be null, string, etc.)
                values[column] = PDUtils.getFieldReturnValue(gr, column);
            }
        });

        return values;
    },
    getProcessTypesThatAllowPublicAccess: function() {
        var gr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_TYPE);
        gr.addQuery(PDConstants.FIELDS.ENABLE_PUBLIC_ACCESS, true);
        gr.query();

        var processTypes = {};

        while (gr.next()) {
            processTypes[gr.getUniqueValue()] = true;
        }

        return processTypes;
    },
    _getFeatureTypes: function() {
        // Return stored value if already loaded
        if (this._featureTypes !== null) {
            return this._featureTypes;
        }

        // Query the dictionary table only once
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addQuery('name', PDConstants.TABLES.PD_PROCESS_TYPE);
        dictGR.addQuery('element', 'IN', PDConstants.PROCESS_TYPE_FEATURE_NAMES);
        dictGR.query();
        var featureInternalTypes = {};
        while (dictGR.next()) {
            featureInternalTypes[dictGR.getValue('element')] = dictGR.getValue('internal_type');
        }

        // Store the result for future calls
        this._featureTypes = featureInternalTypes;
        return featureInternalTypes;
    }
};
