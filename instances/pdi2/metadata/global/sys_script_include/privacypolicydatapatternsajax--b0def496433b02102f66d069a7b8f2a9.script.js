var PrivacyPolicyDataPatternsAjax = Class.create();
PrivacyPolicyDataPatternsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    LEFT_SLUSH_END_MARKER: '$=$=END=$=$',
    /**
     * Fetches available and selected list data patterns for a given privacy configuration.
     * @param sysparm_privacy_config_id sys id of privacy configuration
     * @param sysparm_search_prefix prefix to be applied while fetching available data patterns
     * @param sysparm_right_choice_values CSV of selected data patterns. 
     */
    getPolicyPatternSlushbucketValues: function() {
        var helperApi = new global.PrivacyPolicyPatternHelper();
        var privacyConfigId = this.getParameter('sysparm_privacy_config_id');
        var searchPrefix = this.getParameter('sysparm_search_prefix');
		var configTable = this.getParameter('sysparm_config_table');
        var rightChoiceMap = {};
        var selectedChilds = [];
        if (searchPrefix) {
            var rightValues = this.getParameter('sysparm_right_choice_values');
            if (!rightValues) {
                rightValues = '';
            }
            var arr = rightValues.split(',');
            for (var x in arr) {
                rightChoiceMap[arr[x]] = true;
            }
        } else {
            rightChoiceMap = helperApi.getSelectedDataPatterns(privacyConfigId, configTable);
        }
        selectedDataPatterns = rightChoiceMap;
        var leftDataPatterns = helperApi.getPossibleDataPatterns(searchPrefix, Object.keys(selectedDataPatterns), privacyConfigId);
        this._populateSlushLeftRightValues(leftDataPatterns, selectedDataPatterns);
    },
    /**
     * Populates the left and right windows with specified data patterns.
     */
    _populateSlushLeftRightValues: function(leftDataPatterns, selectedDataPatterns) {
        var item;
        // Populate left slush values
        for (var leftPatternSysId in leftDataPatterns) {
            item = this.newItem();
            item.setAttribute('value', leftPatternSysId);
            item.setAttribute('text', leftDataPatterns[leftPatternSysId]);
        }
        item = this.newItem();
        item.setAttribute('value', this.LEFT_SLUSH_END_MARKER);
        // Populate right slush values
        for (var rightPatternSysId in selectedDataPatterns) {
            item = this.newItem();
            item.setAttribute('value', rightPatternSysId);
            item.setAttribute('text', selectedDataPatterns[rightPatternSysId]);
        }
    },
    /**
     * Presists the user selection (right window) in dp_m2m_configuraiton_pattern table
     * @param sysparm_privacy_config_id sys id of privacy configuration
     * @param sysparm_right_choice_values CSV of selected data patterns.
     */
    savePolicyPatternPreferences: function() {
        var helperApi = new global.PrivacyPolicyPatternHelper();
        var response = {};
        var privacyConfigId = this.getParameter('sysparm_privacy_config_id');
        var rightValues = String(this.getParameter('sysparm_right_choice_values'));
		var configTable = this.getParameter('sysparm_config_table');
        if (!privacyConfigId) {
            return this._returnErrorResponse(gs.getMessage('Invalid Privacy configuration ID'));
        }
        if (!rightValues)
            rightValues = '';
        helperApi.updatePolicyDataPatterns(privacyConfigId, configTable, rightValues.split(','));
        response.status = 'success';
        return JSON.stringify(response);
    },
    /**
     * returns a JSON string with status=error and error message.
     */
    _returnErrorResponse: function(message) {
        var response = {};
        response.status = 'error';
        response.message = message;
        return JSON.stringify(response);
    },
    type: 'PrivacyPolicyDataPatternsAjax'
});
