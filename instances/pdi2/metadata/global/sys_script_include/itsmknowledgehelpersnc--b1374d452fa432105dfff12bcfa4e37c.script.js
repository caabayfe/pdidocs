var ITSMKnowledgeHelperSNC = Class.create();
ITSMKnowledgeHelperSNC.prototype = {
    initialize: function() {},

    INCIDENT: 'incident',

    FIELD_CONSTANTS: {
        CLOSE_NOTES: 'close_notes',
        DESCRIPTION: 'description',
        COMMENTS: 'comments'
    },

    /**
     * Retrieves the values of specified fields from a given record.
     *
     * @param {String} sourceTable - The table name (e.g., 'incident')
     * @param {String} sourceSysId - The sys_id of the record to retrieve
     * @param {Array} fieldsArray - An array of field names to retrieve values for
     * @returns {Object} An object with keys as field names and values as the field values from the record
     *                   (e.g., { description: '...', close_notes: '...', comments: '...' })
     */
    _getIncidentFieldValue: function(sourceTable, sourceSysId, fieldsArray) {
        if (!(gs.hasRole('itil') || gs.hasRole('sn_incident_write')))
            return {};

        var sourceGR = new GlideRecord(sourceTable);
        if (!sourceGR.get(sourceSysId))
            return {};

        var fieldsJSON = {};

        for (var i = 0; i < fieldsArray.length; i++) {
            var fieldName = fieldsArray[i];
            if (!sourceGR.isValidField(fieldName) || !sourceGR[fieldName].canRead())
                continue;

            if (fieldName == this.FIELD_CONSTANTS.COMMENTS)
                fieldsJSON[fieldName] = sourceGR.comments.getHTMLValue();
            else
                fieldsJSON[fieldName] = sourceGR.getValue(fieldName);
        }

        return fieldsJSON;
    },

    /**
     * Formats incident field values for use in a knowledge article body.
     *
     * @param {String} sourceSysId - The sys_id of the incident record
     * @returns {String} A formatted HTML string containing the issue, resolution, and comments,
     *                   suitable for use as the body of a new knowledge article
     */
    getIncFieldValuesForStdTemplate: function(sourceSysId) {
        var issueLabel = gs.getMessage("Issue");
        var resolutionLabel = gs.getMessage("Resolution");
        var commentsLabel = gs.getMessage("Additional comments");

        // Retrieve the relevant field values from the incident
        var fieldsJSON = this._getIncidentFieldValue(
            this.INCIDENT,
            sourceSysId,
            [this.FIELD_CONSTANTS.DESCRIPTION, this.FIELD_CONSTANTS.CLOSE_NOTES, this.FIELD_CONSTANTS.COMMENTS]
        );
        var answer = "";

        // Build the formatted HTML output
        if (this.FIELD_CONSTANTS.DESCRIPTION in fieldsJSON)
            answer += "<p><strong>" + issueLabel + "</strong> - " + fieldsJSON[this.FIELD_CONSTANTS.DESCRIPTION] + "</p>";

        if (this.FIELD_CONSTANTS.CLOSE_NOTES in fieldsJSON)
            answer += "<p><strong>" + resolutionLabel + "</strong> - " + fieldsJSON[this.FIELD_CONSTANTS.CLOSE_NOTES] + "</p>";

        if (this.FIELD_CONSTANTS.COMMENTS in fieldsJSON)
            answer += "<p><strong>" + commentsLabel + "</strong> - " + fieldsJSON[this.FIELD_CONSTANTS.COMMENTS] + "</p>";

        return answer;
    },

    type: 'ITSMKnowledgeHelperSNC'
};
