var MLLabeledData = Class.create();

(function() {

    var tables = NLUConstants.tables;
    var TABLE = 'ml_labeled_data';
    var FIELDS = {
        TEXT: 'text',

        LABEL: 'label',
        LABEL_TABLE: 'label_table',
        LABEL_REFERENCE: 'label_reference',
        LABEL_TYPE: 'label_type',
        CORRECT_LABEL: 'correct_label',
        CORRECT_LABEL_REF: 'correct_label_reference',

        RECOMMENDATION: 'recommendation',
        SOURCE: 'source',
        PRODUCT: 'product',
        USAGE: 'usage',
        FREQUENCY: 'frequency',
        JOB_ID: 'job_id',
        SYS_DOMAIN: 'sys_domain'
    };

    var FEEDBACK_TYPE = {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        IRRELEVANT: 'irrelevant',
        IGNORED: 'ignored',
        SUGGESTED_ADD: 'suggested_addition',
        SUGGESTED_REMOVE: 'suggested_removal'
    };

    var SOURCE = {
        VA: 'virtual_agent',
        NLU: 'nlu_workbench'
    };

    var PRODUCT = {
        NLU: 'nlu'
    };

    var USAGE = {
        TESTING: 'nlu_batch_test',
        MODEL_TRAIN: 'nlu_model_train'
    };

    var LABEL_PREFIX = {
        sys_nlu_model: 'model',
        sys_nlu_intent: 'intent'
    };

    // Export to other scripts: 
    MLLabeledData.TABLE = TABLE;
    MLLabeledData.FIELDS = FIELDS;
    MLLabeledData.FEEDBACK_TYPE = FEEDBACK_TYPE;
    MLLabeledData.SOURCE = SOURCE;
    MLLabeledData.PRODUCT = PRODUCT;
    MLLabeledData.USAGE = USAGE;
    MLLabeledData.LABEL_PREFIX = LABEL_PREFIX;

    var getQuery = function(labelData, filter) {
        var query = FIELDS.TEXT + '=' + labelData.text;
        if (labelData.label_reference) {
            query += '^' + FIELDS.LABEL_REFERENCE + '=' + labelData.label_reference;
            if (labelData.label_table === tables.SYS_NLU_INTENT) {
                var intentGr = NLUIntent.getGRById(labelData.label_reference);
                query += '^OR' + FIELDS.LABEL_REFERENCE + '=' + intentGr.model;
            }
        } else if (labelData.label)
            query += '^' + FIELDS.LABEL + '=' + labelData.label;
        if (filter)
            query += '^' + filter;
        return query;
    };

    MLLabeledData.recordExists = function(labelData, filter) {
        var ga = new GlideAggregate(TABLE);
        ga.addAggregate('COUNT');
        ga.addEncodedQuery(getQuery(labelData, filter));
        ga.query();
        return ga.next() && ga.getAggregate('COUNT') > 0;
    };

    MLLabeledData.getRecords = function(labelData, filter) {
        var gr = new GlideRecord(TABLE);
        gr.addEncodedQuery(getQuery(labelData, filter));
        gr.query();
        return gr;
    };

    MLLabeledData.getRecordBySysId = function(sysId) {
        var gr = new GlideRecord(TABLE);
        return gr.get(sysId) && gr;
    };

    MLLabeledData.createRecord = function(data) {
        if (!data || !data[FIELDS.TEXT]) return null; // text is mandatory
        var gr = new GlideRecord(TABLE);
        gr.newRecord();
        for (var key in FIELDS) {
            var field = FIELDS[key];
            if (data[field]) gr.setValue(field, data[field]);
        }
        return gr.insert();
    };

    MLLabeledData.deleteRecords = function(filter) {
        if (!filter) return null;
        var gr = new GlideRecord(TABLE);
        gr.addEncodedQuery(filter);
        return gr.deleteMultiple();
    };

    MLLabeledData.prototype = {

        initialize: function(sysId, gr) {
            this.sysId = sysId;
            if (!gs.nil(gr)) {
                this.gr = gr;
                this.sysId = gr.getUniqueValue();
            }
        },

        getGr: function() {
            if (!this.gr) this.gr = MLLabeledData.getRecordBySysId(this.sysId);
            return this.gr;
        },

        updateLabelType: function(labelType) {
            var data = {};
            data[FIELDS.LABEL_TYPE] = labelType;
            return this.updateData(data);
        },

        updateTarget: function(product, usage) {
            var data = {};
            data[FIELDS.PRODUCT] = product;
            data[FIELDS.USAGE] = usage;
            return this.updateData(data);
        },

        updateData: function(data) {
            var gr = this.getGr();
            for (var field in data)
                gr.setValue(field, data[field]);
            return gr.update();
        },

        deleteRecord: function() {
            var gr = this.getGr();
            return gr && gr.deleteRecord();
        },

        type: 'MLLabeledData'
    };
})();
