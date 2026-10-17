var UnallocatedEntityRule_RuleQualifyingDataBuilder = Class.create();
UnallocatedEntityRule_RuleQualifyingDataBuilder.prototype = {
    initialize: function(ruleName) {
        this._qualifyingData = {
            rule: ruleName,
            data: [],
            tests: []
        };
    },

    /**
     * Retrieves the output of the qualifying data that was generated from calling the supporting functions
     * addData(key, value) and addTestResult(roleId, result)
     *
     * @returns {object} An object that identifies the rule, data used, and tests run.
     */
    getQualifyingData: function() {
        return this._qualifyingData;
    },

    /**
     * Adds data that was used during a business rule's test
     *
     * @param {string} key A unique identifier for the data that was used during the rule execution
     * @param {object} value An object that represents the data used 
     */
    addData: function(key, value) {
        this.getQualifyingData().data.push({
            [key]: value
        });
    },

    /**
     * Adds test results that occured during a business rule's execution
     *
     * @param {guid} roleId The roleId that was tested by the business rule
     * @param {bool} result The outcome of testing the roleId
     */
    addTestResult: function(roleId, result) {
        this.getQualifyingData().tests.push({
            role_id: roleId,
            result: result
        });
    },

    type: 'UnallocatedEntityRule_RuleQualifyingDataBuilder'
};
