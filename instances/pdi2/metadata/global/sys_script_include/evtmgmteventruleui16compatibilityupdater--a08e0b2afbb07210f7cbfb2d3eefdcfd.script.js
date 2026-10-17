/**
 * This script updates the is_ui16_compatible field in em_match_rule table for all existing event rules
 **/

var EvtMgmtEventRuleUI16CompatibilityUpdater = Class.create();
EvtMgmtEventRuleUI16CompatibilityUpdater.prototype = {
    TABLE: {
        EVENT_RULE: 'em_match_rule',
        MAPPING_RULE: 'em_mapping_rule',
    },

    EVENT_RULE_FIELDS: {
        UI16_COMPATIBLE: 'is_ui16_compatible',
        EVENT_RULE: 'event_rule',
        IGNORE_EVENT: 'ignore_event',
        RUN_IGNORE_BEFORE_ENRICH: 'run_ignore_before_enrich',
        EVENT_DATA: 'event_data',
        FIELD_NAME: 'field_name',
        REGEX: 'regex',
        FIELDS_USAGE: 'fields_usage',
        BIND_FALLBACKS: 'bind_fallbacks',
    },
    FIELDS_USAGE: {
        ALL_FIELDS: 'ALL_FIELDS'
    },

    initialize: function() {
        this.LOG_PREFIX = 'EvtMgmtEventRuleUI16CompatibilityUpdater: ';

        // Statistics
        this.updatedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
        this.totalRecords = 0;
    },

    /**
     * Main execution method to update all event rules
     */
    processAllEventRules: function() {
        const startTime = new GlideDateTime();
        const startTimeString = startTime.getDisplayValue();
        var eventRuleGr = new GlideRecord(this.TABLE.EVENT_RULE);
        
        if (!eventRuleGr.isValidField(this.EVENT_RULE_FIELDS.UI16_COMPATIBLE)) {
            const errorMsg = 'Field ' + this.EVENT_RULE_FIELDS.UI16_COMPATIBLE + 
                           ' does not exist on table ' + this.TABLE.EVENT_RULE;
            gs.error(this.LOG_PREFIX + errorMsg);
            return {
                success: false,
                message: errorMsg,
                startTime: startTimeString,
                endTime: new GlideDateTime().getDisplayValue()
            };
        }

        eventRuleGr.query();
        this.totalRecords = eventRuleGr.getRowCount();

        if (this.totalRecords === 0) {
            gs.info(this.LOG_PREFIX + 'No event rules found to process');
            return {
                success: true,
                message: 'No event rules found to process',
                startTime: startTimeString,
                endTime: new GlideDateTime().getDisplayValue()
            };
        }
        
        while (eventRuleGr.next()) {
            try {
                this._processSingleRule(eventRuleGr);
            } catch (e) {
                this.errorCount++;
                gs.error(this.LOG_PREFIX + 'Error processing rule ' +
                    eventRuleGr.getDisplayValue() + ' (' + eventRuleGr.getUniqueValue() + '): ' + e, 
                    'UI16Compatibility');
            }
        }

        var endTime = new GlideDateTime();
        var durationSeconds = (endTime.getNumericValue() - startTime.getNumericValue()) / 1000;

        var endTimeString = endTime.getDisplayValue();
        return {
            success: true,
            message: 'Processing completed',
            startTime: startTime.getDisplayValue(),
            endTime: endTime.getDisplayValue(),
			durationSeconds: durationSeconds,
            stats: {
                total: this.totalRecords,
                updated: this.updatedCount,
                skipped: this.skippedCount,
                errors: this.errorCount
            }
        };
    },


    /**
     * Process a single event rule
     */
    _processSingleRule: function(ruleGr) {
        if (!ruleGr || !ruleGr.isValidRecord()) {
            gs.error(this.LOG_PREFIX + 'Invalid rule record provided');
            this.errorCount++;
            return;
        }

        // Check ignore rule conditions
        if (this._isIgnoreRule(ruleGr)) {
            this._updateRuleCompatibility(ruleGr, false);
            return;
        }

        // Check for binding fallbacks
        if (this._hasBindingFallback(ruleGr)) {
            this._updateRuleCompatibility(ruleGr, false);
            return;
        }

        // Check for multiple regex patterns
        if (this._hasMultipleRegexPatterns(ruleGr)) {
            this._updateRuleCompatibility(ruleGr, false);
            return;
        }

        // Check for mapping rules
        if (this._hasMappingRules(ruleGr)) {
            this._updateRuleCompatibility(ruleGr, false);
            return;
        }

        // If we get here, the rule is compatible
        this._updateRuleCompatibility(ruleGr, true);
    },

    /**
     * Check if the rule is an ignore rule with run_ignore_before_enrich
     */
    _isIgnoreRule: function(ruleGr) {
		if (!ruleGr.isValidField(this.EVENT_RULE_FIELDS.IGNORE_EVENT) || 
            !ruleGr.isValidField(this.EVENT_RULE_FIELDS.RUN_IGNORE_BEFORE_ENRICH)) {
            return false;
        }

        var ignoreEvent = ruleGr.getValue(this.EVENT_RULE_FIELDS.IGNORE_EVENT) == '1' || ruleGr.getValue(this.EVENT_RULE_FIELDS.IGNORE_EVENT) == 'true';
        var runIgnoreBeforeEnrich = ruleGr.getValue(this.EVENT_RULE_FIELDS.RUN_IGNORE_BEFORE_ENRICH) == '1' || ruleGr.getValue(this.EVENT_RULE_FIELDS.RUN_IGNORE_BEFORE_ENRICH) == 'true';
        return ignoreEvent && runIgnoreBeforeEnrich;
    },

    /**
     * Check if the rule has any mapping rules
     */
    _hasMappingRules: function(ruleGr) {
        if (!ruleGr || !ruleGr.isValidRecord()) {
            return false;
        }
        
        const eventRuleId = ruleGr.getUniqueValue();
        const mappingGr = new GlideRecord(this.TABLE.MAPPING_RULE);
        
        if (!mappingGr.isValidField(this.EVENT_RULE_FIELDS.EVENT_RULE)) {
            return false;
        }
        
        mappingGr.addQuery(this.EVENT_RULE_FIELDS.EVENT_RULE, eventRuleId);
        mappingGr.setLimit(1);
        mappingGr.query();
        return mappingGr.hasNext();
    },

    /**
     * Check if the rule has binding fallbacks (with special case handling)
     */
    _hasBindingFallback: function(ruleGr) {
        if (!ruleGr.isValidField(this.EVENT_RULE_FIELDS.BIND_FALLBACKS)) {
            return false;
        }
		var bindFallbacks = ruleGr.getValue(this.EVENT_RULE_FIELDS.BIND_FALLBACKS);
        if (!bindFallbacks) {
            return false;
        }
        
        try {
            var fallbacks = JSON.parse(bindFallbacks);
            if (!Array.isArray(fallbacks) || fallbacks.length === 0) {
                return false;
            }

            // Special case: Single fallback with ALL_FIELDS is compatible
            if (fallbacks.length === 1 && fallbacks[0] && fallbacks[0].fieldsUsage === this.FIELDS_USAGE.ALL_FIELDS) {
                return false;
            }

            return fallbacks.length > 0;
        } catch (e) {
            gs.error(this.LOG_PREFIX + 'Error parsing bind_fallbacks for rule ' +
                ruleGr.getDisplayValue() + ' (' + ruleGr.getUniqueValue() + '): ' + e);
            return false; // Default to false on error to be safe
        }
    },
    /**
     * Helper function to check if any field in the given array has more than one regex pattern defined.
     * Short-circuits and returns true as soon as a field with more than one regex is found.
     * @param {Array} fields - Array of field objects to check
     * @returns {boolean} true if any field has more than one regex pattern, false otherwise
     * @private
     */
    _hasMultipleRegexInFields: function(fields) {
        if (!fields || !Array.isArray(fields)) {
            return false;
        }

        var fieldRegexCount = {};
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field && field.name && field.regex && field.regex.trim() !== '') {
                fieldRegexCount[field.name] = (fieldRegexCount[field.name] || 0) + 1;
                if (fieldRegexCount[field.name] > 1) {
                    return true;
                }
            }
        }

        return false;
    },

    /**
     * Check if any field has multiple regex patterns in the event data.
     * rawFields and additionalInfoFields are checked separately —
     * a field appearing once in each array is NOT considered a duplicate.
     */
    _hasMultipleRegexPatterns: function(ruleGr) {
        if (!ruleGr.isValidField(this.EVENT_RULE_FIELDS.EVENT_DATA)) {
            return false;
        }
        try {
            var eventData = ruleGr.getValue(this.EVENT_RULE_FIELDS.EVENT_DATA);
            if (!eventData) {
                return false;
            }

            var eventDataObj;
            try {
                eventDataObj = JSON.parse(eventData);
            } catch (e) {
                gs.error(this.LOG_PREFIX + 'Error parsing event_data JSON for rule ' +
                    ruleGr.getDisplayValue() + ': ' + e);
                return false;
            }

            return this._hasMultipleRegexInFields(eventDataObj.rawFields) ||
                   this._hasMultipleRegexInFields(eventDataObj.additionalInfoFields);

        } catch (e) {
            gs.error(this.LOG_PREFIX + 'Error checking multiple regex patterns for rule ' +
                ruleGr.getDisplayValue() + ': ' + e);
            return false; // Default to false on error to be safe
        }
    },
    /**
     * Update the compatibility flag for a rule if needed
     */
    _updateRuleCompatibility: function(ruleGr, isCompatible) {
        var currentValue = ruleGr.getValue(this.EVENT_RULE_FIELDS.UI16_COMPATIBLE) === '1';
        if (currentValue === isCompatible) {
            this.skippedCount++;
            return;
        }

        try {
            ruleGr.setValue(this.EVENT_RULE_FIELDS.UI16_COMPATIBLE, isCompatible);

            if (ruleGr.update()) {
                this.updatedCount++;
            } else {
                throw new Error('Failed to update rule: ' + ruleGr.getDisplayValue());
            }
        } catch (e) {
            this.errorCount++;
            gs.error(this.LOG_PREFIX + 'Error updating rule ' +
                ruleGr.getDisplayValue() + ': ' + e.message, 'UI16Compatibility');
        }
    },

    type: 'EvtMgmtEventRuleUI16CompatibilityUpdater'
};
