var RecommendedActionsAjaxImpl = Class.create();
RecommendedActionsAjaxImpl.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    createSearchResultMapping: function() {
        var createRecordCount = 0;
        var contextSysId = this.getParameter('sysparm_contextSysId');
        var contextGr = new GlideRecordSecure(Constants.TBL_RULE_CONTEXT);
        contextGr.get(contextSysId);
        if (contextGr) {
            var searchApplicationConfiguration = contextGr.getValue("search_application_configuration");
            var validSources = this._validSearchSourcesOfSearchAppConfig(searchApplicationConfiguration);
            validSources.forEach(function(source) {
                //check if the source exists
                var searchResultMappingRecord = new GlideRecordSecure(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                searchResultMappingRecord.addQuery(Constants.COL_CONTEXT, contextSysId);
                searchResultMappingRecord.addQuery(Constants.COL_SEARCH_SOURCE_TABLE, source);
                searchResultMappingRecord.query();
                if (!searchResultMappingRecord.hasNext()) {
                    createRecordCount++;
                    var insertRASearchMapping = new GlideRecordSecure(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                    insertRASearchMapping.initialize();
                    insertRASearchMapping.setValue(Constants.COL_CONTEXT, contextGr.getValue(Constants.COL_SYS_ID));
                    insertRASearchMapping.setValue(Constants.COL_ACTION_TYPE, "e38f55b9b72120107d472397ee11a9be"); //guidance
                    insertRASearchMapping.setValue(Constants.COL_ACTION, "4f75f24543ed5e109a8b04836ab8f207"); //Default guidance for search results  
                    insertRASearchMapping.setValue(Constants.COL_SEARCH_SOURCE_TABLE, source);
                    insertRASearchMapping.setValue(Constants.COL_ACTIVE, true);
                    var sysId = insertRASearchMapping.insert();
                    //update the action inputs
                    var updateRASearchMapping = new GlideRecordSecure(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
                    updateRASearchMapping.get(sysId);
                    if (updateRASearchMapping) {
                        var keys = Object.keys(updateRASearchMapping.action_input);
                        keys.forEach(function(key) {
                            switch (key) {
                                case "search_table":
                                    updateRASearchMapping.action_input[key] = "{{search_result_table}}";
                                    break;
                                case "search_result_preview":
                                    updateRASearchMapping.action_input[key] = "{{search_result_preview}}";
                                    break;
                                case "search_result_title":
                                    updateRASearchMapping.action_input[key] = "{{search_result_title}}";
                                    break;
                                case "search_teaser_text":
                                    updateRASearchMapping.action_input[key] = "{{search_teaser_text}}";
                                    break;
                                case "search_sys_id":
                                    updateRASearchMapping.action_input[key] = "{{search_result_sysId}}";
                                    break;
                            }
                            updateRASearchMapping.update();
                        });
                    }
                }
            });
        }
        if (createRecordCount == 0)
            return false;
        else
            return true;

    },

    /**
     * function to get the list of search sources for given search application
     * config
     */
    _validSearchSourcesOfSearchAppConfig: function(searchApplicationConfiguration) {
        var gr = new GlideRecord(Constants.TBL_SEARCH_FILTER);
        gr.addQuery(Constants.COL_SEARCH_CONTEXT_CONFIG, searchApplicationConfiguration);
        gr.query();
        var searchSources = new Set();
        while (gr.next()) {
            searchSources.add(gr.ais_search_source.datasource.source + "");
        }
        return searchSources;
    },

    /**
     * function to check if all the search sources are mapped to the guidance
     */
    isRefreshMappingNeeded: function(contextSysId) {
        if (contextSysId == undefined)
            return true; //no mapping records present for the context

        var contextGr = new GlideRecordSecure(Constants.TBL_RULE_CONTEXT);
        contextGr.get(contextSysId);
        if (contextGr) {
            var searchApplicationConfiguration = contextGr.getValue("search_application_configuration");
            var validSources = this._validSearchSourcesOfSearchAppConfig(searchApplicationConfiguration);
            //get current context search result mapping records
            var currentSearchResultMappings = new Set();
            var searchResultMappingRecord = new GlideRecordSecure(Constants.TBL_SEARCH_RESULT_RA_MAPPING);
            searchResultMappingRecord.addQuery(Constants.COL_CONTEXT, contextSysId);
            searchResultMappingRecord.query();
            while (searchResultMappingRecord.next()) {
                currentSearchResultMappings.add(searchResultMappingRecord.search_source_table + "");
            }
            //compare currentSearchResultMappings and validSources
            if (currentSearchResultMappings.size != validSources.size)
                return true;

            return currentSearchResultMappings.forEach(val => {
                if (!validSources.has(val)) return true;
            });
        }
        return false;
    },

    /**
     * Generates sample JSON based on context inputs
     */
    generateJsonFromContextInputs: function() {
        var contextSysId = this.getParameter('sysparm_contextSysId');
        var contextInputsJson = {};
        var contextInputGr = new GlideRecordSecure(Constants.TBL_CONTEXT_INPUT);
        contextInputGr.addQuery(Constants.COL_MODEL, contextSysId);
        contextInputGr.addQuery(Constants.COL_ELEMENT, '!=', Constants.CONTEXT_TABLE_INPUT);
        contextInputGr.query();
        while (contextInputGr.next()) {
            contextInputsJson[contextInputGr.getValue(Constants.COL_ELEMENT)] = gs.getMessage("<Enter {0} input>", contextInputGr.getValue(Constants.COL_INTERNAL_TYPE));
        }

        return JSON.stringify(contextInputsJson);
    },

    checkIfContextInputsExist: function() {
        var excludeContextTableInput = this.getParameter('sysparm_excludeContextTableInput');
        var contextInputGr = new GlideRecord(Constants.TBL_CONTEXT_INPUT);
        contextInputGr.addQuery(Constants.COL_MODEL, this.getParameter('sysparm_contextSysId'));
        if (excludeContextTableInput) {
            contextInputGr.addQuery(Constants.COL_ELEMENT, '!=', Constants.CONTEXT_TABLE_INPUT);
        }
        contextInputGr.query();
        if (contextInputGr.hasNext())
            return true;
        else
            return false;
    },
    addContextTablePrefix: function() {
        var tablePrefix = Constants.CONTEXT_TABLE_INPUT;
        var queryString = this.getParameter('sysparm_ruleQuery');
        if (!queryString || typeof queryString !== 'string') {
            return queryString;
        }
        var originalQuery = queryString;
        var hasEQ = queryString.endsWith('^EQ');
        // Remove ^EQ if present, will add it back at the end
        if (hasEQ) {
            queryString = queryString.substring(0, queryString.length - 3);
        }

        try {
            var contextSysId = this.getParameter('sysparm_contextSysId');
            var contextGr = new GlideRecordSecure(Constants.TBL_RULE_CONTEXT);
            contextGr.get(contextSysId);
            var terms = global.GlideQueryParser.getTerms(contextGr.getValue(Constants.COL_CONTEXT), queryString);

            if (!terms || !terms.length) {
                return originalQuery;
            }

            var processedTerms = [];

            //Operators which have value also dynamic hence needs context_table as a prefix for it
            var fieldOperators = [
                'GT_OR_EQUALS_FIELD', 'LT_OR_EQUALS_FIELD', 'GT_FIELD',
                'LT_FIELD', 'SAMEAS', 'NSAMEAS', 'MORETHAN', 'LESSTHAN'
            ];

            for (var i = 0; i < terms.length; i++) {
                var term = terms[i];
                var field = term.field;
                var operator = term.operator;
                var value = term.value;
                var isOr = term.isOr;
                var isNewQuery = term.isNewQuery;

                if (!field || field === '123TEXTQUERY321' || ['OR', 'NQ'].includes(field)) {
                    var originalTerm = '';
                    if (isOr) originalTerm += 'OR';
                    if (isNewQuery) originalTerm += 'NQ';
                    if (field) originalTerm += field;
                    if (operator) originalTerm += operator;
                    if (value !== undefined) originalTerm += value;

                    processedTerms.push(originalTerm);
                    continue;
                }

                var processedValue = value;
                if (fieldOperators.includes(operator)) {
                    if (operator === 'MORETHAN' || operator === 'LESSTHAN') {
                        var valueParts = value.split('@');
                        // Add prefix to the field reference part only
                        valueParts[0] = tablePrefix + '.' + valueParts[0];
                        processedValue = valueParts.join('@');
                    } else {
                        processedValue = tablePrefix + '.' + value;
                    }
                }

                var prefixedTerm = '';
                if (isOr) prefixedTerm += 'OR';
                if (isNewQuery) prefixedTerm += 'NQ';
                prefixedTerm += tablePrefix + '.' + field + operator + processedValue;

                processedTerms.push(prefixedTerm);
            }

            var finalQuery = processedTerms.join('^');
            if (hasEQ) {
                finalQuery += '^EQ';
            }
            return finalQuery;
        } catch (err) {
            gs.error('Error in adding context table as prefix: ' + err);
            return originalQuery;
        }
    },


    type: 'RecommendedActionsAjaxImpl'
});
