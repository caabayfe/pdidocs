var IntentDiscoveryConfigUtil = Class.create();
IntentDiscoveryConfigUtil.prototype = {
    initialize: function() {
        this.default_version = "rome";
        this.version = this._lookupVersion();
    },
    glideVersionSupportsNLUFeatures: function() {
        if (this.isParis() || this.isOrlando()) {
            return false;
        }
        return true;
    },
    // Support for solution properties
    glideVersionSupportsAPI: function() {
        if (this.isOrlando()) {
            return false;
        }
        return true;
    },
    isRome: function() {
        if (!this.version) {
            gs.warn("Version not set");
            return false;
        }
        if (this.version === "rome") {
            return true;
        }
        return false;
    },
    isQuebec: function() {
        if (!this.version) {
            gs.warn("Version not set");
            return false;
        }
        if (this.version === "quebec") {
            return true;
        }
        return false;
    },
    isParis: function() {
        if (!this.version) {
            gs.warn("Version not set");
            return false;
        }
        if (this.version === "paris") {
            return true;
        }
        return false;
    },
    isOrlando: function() {
        if (!this.version) {
            gs.warn("Version not set");
            return false;
        }
        if (this.version === "orlando") {
            return true;
        }
        return false;
    },
    _lookupVersion: function() {
        var version;
        if (gs.getProperty('com.glide.embedded_help.version')) {
            version = gs.getProperty('com.glide.embedded_help.version').toLowerCase();
        } else {
            var gr = new GlideRecord('sys_upgrade_history');
            gr.addEncodedQuery('from_version!=n/a');
            gr.setLimit('1');
            gr.orderByDesc('upgrade_finished');
            gr.query();
            if (gr.next() && gr.to_version.split("-").length > 1) {
                version = gr.to_version.split("-")[1];
            }
        }
        return version || this.default_version;
    },
    // Check columns exist in a table, return only the columns that exist. 
    checkFieldsAreValid: function(tableName, fieldsToCheck) {
        var gr = new GlideRecord(tableName);
        var validFields = [];
        for (var i = 0; i < fieldsToCheck.length; i++) {
            if (gr.isValidField(fieldsToCheck[i])) {
                validFields.push(fieldsToCheck[i]);
            }
        }
        return validFields;
    },
    getTaxonomyModels: function() {
        var taxonomyModels = [];
        var choiceList = GlideChoiceList.getChoiceList('sn_nlu_discovery_report_definition', 'model');
        choiceList.removeNone();
        for (var i = 0; i < choiceList.getSize(); i++) {
            var choice = choiceList.getChoice(i);
            taxonomyModels.push({
                label: choice.getLabel(),
                value: choice.getValue()
            });
        }
        return taxonomyModels;
    },

    type: 'IntentDiscoveryConfigUtil'
};
