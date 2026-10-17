var NLULookup = Class.create();

(function() {
    var tables = NLUConstants.tables;
    var vocabTypes = NLUConstants.VOCAB_TYPES;

    NLULookup.trainMultipleLookups = function(lookupIds, options) {
        var result = {
            status: 'success',
            lookupDetails: []
        };
        try {
            lookupIds.forEach(function(lookupId) {
                var lookupTrainResult = new NLULookupTrainer(lookupId).trainLookup(options);
                if (lookupTrainResult.status === 'failure')
                    result.status = 'failure';
                result.lookupDetails.push(lookupTrainResult.lookupDetails);
            });
        } catch (e) {
            gs.debug('NLULookup trainMultipleLookups error: ' + e.message);
            result.status = 'failure';
        }
        return result;
    };

    NLULookup.getGR = function(handleNameList, filter) {
        var lookupGR = new GlideRecord(tables.SYS_NLU_VOCABULARY);
        lookupGR.addQuery('type', 'IN', vocabTypes.lookup + ',' + vocabTypes.static_lookup);
        lookupGR.addQuery('name', 'IN', handleNameList.join(', '));
        if (filter) lookupGR.addEncodedQuery(filter);
        lookupGR.query();
        return lookupGR;
    };

    NLULookup.prototype = {
        initialize: function(lookupId, lookupGR) {
            this.lookupId = lookupId;
            this.lookupGR = lookupGR;
            if (lookupGR) this.lookupId = lookupGR.getUniqueValue();
        },

        getGR: function() {
            if (!this.lookupGR) {
                this.lookupGR = new GlideRecord(tables.SYS_NLU_VOCABULARY);
                if (!this.lookupGR.get(this.lookupId))
                    this.lookupGR = null;
            }
            return this.lookupGR;
        },

        getStatus: function() {
            if (!this.lookupIntegrator)
                this.lookupIntegrator = new NLULookupIntegrator(this.getGR());
            return this.lookupIntegrator.getModelStatus();
        },

        getLastTrainedOn: function() {
            if (!this.lookupIntegrator)
                this.lookupIntegrator = new NLULookupIntegrator(this.getGR());
            var solutionVersion = this.lookupIntegrator.getLastTrainedVersion();
            var solutionProps = solutionVersion && JSON.parse(solutionVersion.getProperties());
            return solutionProps && solutionProps.sys_updated_on;
        },

        type: 'NLULookup'
    };
})();
