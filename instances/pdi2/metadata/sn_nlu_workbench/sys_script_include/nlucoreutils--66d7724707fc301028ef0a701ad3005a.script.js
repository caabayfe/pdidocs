var NLUCoreUtils = Class.create();

(function() {

    var coreTables = global.NLUConstants.tables;
    var DEFAULT_VERSION = 'latest';

    NLUCoreUtils.toLower = function(x) {
        return x.trim().toLowerCase();
    };

    NLUCoreUtils.getIntentGrByName = function(name, filter) {
        var intentGr = new GlideRecord(coreTables.SYS_NLU_INTENT);
        intentGr.addQuery('name', 'IN', name);
        if (filter) intentGr.addEncodedQuery(filter);
        intentGr.query();

        return intentGr;
    };

    NLUCoreUtils.getTrainedIntentNamesMap = function(modelIds, transformer) {
        if (!modelIds) return [];

        var intentNamesMap = {};

        var gr = new GlideRecord(coreTables.SYS_NLU_MODEL);
        if (Array.isArray(modelIds))
            gr.addQuery('sys_id', 'IN', modelIds.join());
        else
            gr.addQuery('sys_id', 'IN', modelIds);
        gr.query();
        while (gr.next()) {
            var intentNames = [];
            try {
                var parlo = new global.NLUParloIntegrator(gr);
                var trainedSolution = global.NLUParloIntegrator.getLastTrainedVersion(parlo.getSolution());
                var propsJson = JSON.parse(trainedSolution.getProperties());

                propsJson.authoringModel.intents.forEach(function(intentData) {
                    intentNames.push(
                        transformer ? transformer(intentData.name) : intentData.name
                    );
                });
            } catch (ex) {
                gs.error('Failed to get trained intents for model: ' + gr.getUniqueValue());
            }
            intentNamesMap[gr.getUniqueValue()] = {
                name: gr.getValue('name'),
                intents: intentNames.filter(function(intent) {
                    return intent != 'no_intent';
                })
            };
        }

        return intentNamesMap;
    };

    NLUCoreUtils.getIntentIdsFromModelName = function(modelName) {
        var intentIds = [];

        var intentGr = new GlideRecord(coreTables.SYS_NLU_INTENT);
        intentGr.addEncodedQuery('enableISEMPTY^ORenable=true');
        intentGr.addQuery('model.name', modelName);
        intentGr.query();
        while (intentGr.next()) {
            intentIds.push(intentGr.getUniqueValue());
        }
        return intentIds;
    };

    NLUCoreUtils.getIntentCount = function(filter) {
        var intentGa = new GlideAggregate(coreTables.SYS_NLU_INTENT);
        intentGa.addAggregate('COUNT');
        if (filter) intentGa.addEncodedQuery(filter, true);
        intentGa.query();
        return intentGa.next() ? intentGa.getAggregate('COUNT') : 0;
    };

    NLUCoreUtils.getPercentage = function(score) {
        var num = (score || 0) * 100;
        var decimalFraction = Math.pow(10, 2);
        return (Math.round(num * decimalFraction) / decimalFraction).toString();
    };

    NLUCoreUtils.getFamilyVersion = function() {
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
        return version || DEFAULT_VERSION;
    };

    NLUCoreUtils.getSuportedLanguages = function(releaseFeature) {
        var data = [];
        if (releaseFeature === 'optimize') {
            var supportedLanguages = NLUBatchTestIntegrator.getOptimizeSupportedLanguages();
            data = Object.keys(supportedLanguages && supportedLanguages.optimizeSupportMap || {});
        }
        return data;
    };

    NLUCoreUtils.getAssignedEditors = function(modelId) {
        var modelStatusGr = new GlideRecord(coreTables.SYS_NLU_MODEL_STATUS);
        modelStatusGr.addQuery('model.sys_id', modelId);
        modelStatusGr.query();
        if (modelStatusGr.next()) {
            var authorList = modelStatusGr.getValue('author');
            return authorList ? authorList.split(',') : [];
        }
    };

    NLUCoreUtils.updateEditorsForModel = function(modelId, authorsList) {
        var modelStatusGr = new GlideRecord(coreTables.SYS_NLU_MODEL_STATUS);
        modelStatusGr.addQuery('model.sys_id', modelId);
        modelStatusGr.query();
        if (modelStatusGr.next()) {
            modelStatusGr.setValue('author', authorsList);
            return modelStatusGr.update();
        }
    }

    NLUCoreUtils.prototype = {
        initialize: function() {},

        type: 'NLUCoreUtils'
    };
})();
