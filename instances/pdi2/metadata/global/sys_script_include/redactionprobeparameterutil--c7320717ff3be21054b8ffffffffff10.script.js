var RedactionProbeParameterUtil = Class.create();

RedactionProbeParameterUtil.prototype = {

    initialize: function() {
    },

    sync: function(probeSysId) {
        if (!probeSysId)
            return;

        var regexGroups = this._getRegexGroups(probeSysId);

        var paramGR = new GlideRecord('discovery_probe_parameter');
        paramGR.addQuery('probe', probeSysId);
        paramGR.addQuery('name', 'redaction_regex');
        paramGR.query();

        if (Object.keys(regexGroups).length > 0) {
            var jsonValue = JSON.stringify(regexGroups);
            var escapedJson = XMLUtilJS.escapeForXMLText(jsonValue);
            if (!paramGR.next()) {
                paramGR.initialize();
                paramGR.probe = probeSysId;
            }
            paramGR.name = 'redaction_regex';
            paramGR.value = escapedJson;
            paramGR.update();
        } else {
            // If there are no more redaction rules for this probe, delete the parameter.
            if (paramGR.next())
                paramGR.deleteRecord();
        }
    },

    _getRegexGroups: function(probeSysId) {
        var regexGroups = {};
        var gr = new GlideRecord('discovery_sensitive_data_filter');
        gr.addActiveQuery();
        gr.addQuery('probe', probeSysId);
        gr.query();

        while (gr.next()) {
            var key = gr.getValue('key') || 'ALL';
            var regex = gr.getValue('regex') + '';
            if (!regexGroups[key]) {
                regexGroups[key] = [];
            }
            regexGroups[key].push(regex);
        }

        return regexGroups;
    },

    type: 'RedactionProbeParameterUtil'
};
