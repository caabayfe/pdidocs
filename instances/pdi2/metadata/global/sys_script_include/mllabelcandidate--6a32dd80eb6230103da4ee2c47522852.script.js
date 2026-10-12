var MLLabelCandidate = Class.create();
(function() {
    var TABLE = 'ml_label_candidate';
    var FIELDS = {
        TEXT: 'text',

        SUGGESTED_LABEL: 'suggested_label',
        RECOMMENDATION: 'recommendation',

        SOURCE: 'source',
        PRODUCT: 'product',
        FREQUENCY: 'frequency',

        LAST_RECEIVED_TIME: 'last_received_time',
        COMMENTS: 'comments',
        DISCREPANCY: 'discrepancy'
    };

    var getQuery = function(labelCandidateData, filter) {
        var query = FIELDS.TEXT + '=' + labelCandidateData.text;
        if (labelCandidateData.label)
            query += '^' + FIELDS.SUGGESTED_LABEL + '=' + labelCandidateData.suggested_label;
        if (filter)
            query += '^' + filter;
        return query;
    };

    MLLabelCandidate.recordExists = function(labelCandidateData, filter) {
        var ga = new GlideAggregate(TABLE);
        ga.addAggregate('COUNT');
        ga.addEncodedQuery(getQuery(labelCandidateData, filter));
        ga.query();
        return ga.next() && ga.getAggregate('COUNT') > 0;
    };

    MLLabelCandidate.getRecords = function(labelCandidateData, filter) {
        var gr = new GlideRecord(TABLE);
        gr.addEncodedQuery(getQuery(labelCandidateData, filter));
        gr.query();
        return gr;
    };

    MLLabelCandidate.getRecordBySysId = function(sysId) {
        var gr = new GlideRecord(TABLE);
        return gr.get(sysId) && gr;
    };

    MLLabelCandidate.createRecord = function(data) {
        if (!data || !data[FIELDS.TEXT]) return null; // text is mandatory
        var gr = new GlideRecord(TABLE);
        gr.newRecord();
        for (var key in FIELDS) {
            var field = FIELDS[key];
            if (data[field]) gr.setValue(field, data[field]);
        }
        return gr.insert();
    };

    MLLabelCandidate.deleteRecords = function(filter) {
        if (!filter) return null;
        var gr = new GlideRecord(TABLE);
        gr.addEncodedQuery(filter);
        return gr.deleteMultiple();
    };

    MLLabelCandidate.prototype = {
        initialize: function(sysId, gr) {
            this.sysId = sysId;
            if (!gs.nil(gr)) {
                this.gr = gr;
                this.sysId = gr.getUniqueValue();
            }
        },

        getGr: function() {
            if (!this.gr) this.gr = MLLabelCandidate.getRecordBySysId(this.sysId);
            return this.gr;
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

        type: 'MLLabelCandidate'
    };
})();
