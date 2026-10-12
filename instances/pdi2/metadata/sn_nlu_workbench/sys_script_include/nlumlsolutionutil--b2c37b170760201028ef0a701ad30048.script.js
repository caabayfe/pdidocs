var NLUMLSolutionUtil = Class.create();

(function() {
    var tables = NLUWorkbenchConstants.tables;
    var FIELDS = {
        NAME: 'solution_name',
        VERSION: 'version',
        UPDATED_ON: 'sys_updated_on',
        STATUS: 'status'
    };

    NLUMLSolutionUtil.getMlGr = function(solutionName, solutionVersion) {
        var mlSolutionGr = new GlideRecord(tables.ML_SOLUTION);
        mlSolutionGr.addQuery(FIELDS.NAME, solutionName);
        mlSolutionGr.addQuery(FIELDS.VERSION, solutionVersion);
        mlSolutionGr.orderByDesc(FIELDS.UPDATED_ON); // Not really needed, but just worst case, if there are > 1 record
        mlSolutionGr.query();
        if (mlSolutionGr.next()) return mlSolutionGr;
        return null;
    };

    NLUMLSolutionUtil.getSolutionName = function(solutionId) {
        var mlGr = new GlideRecord(tables.ML_SOLUTION);
        return mlGr.get(solutionId) && mlGr.getValue(FIELDS.NAME);
    };

    NLUMLSolutionUtil.getIntents = function(solutionVersion, modelId) {
        var intentNames = [];

        var nluModel = new global.NLUModel(modelId);
        var parloIntegrator = new global.NLUParloIntegrator(nluModel.getGR());
        var solution = parloIntegrator.getSolution();
        var solutionVersionObj = solution.getVersion(solutionVersion);
        var solutionProps = JSON.parse(solutionVersionObj.getProperties());

        var authoringModel = solutionProps.authoringModel;
        var intentObjects = authoringModel.intents;
        for (var i = 0; i < intentObjects.length; i++) {
            intentNames.push(intentObjects[i].name);
        }
        return {
            intents: intentNames,
            model: authoringModel.name
        };
    };

    NLUMLSolutionUtil.getModelSolutionInfo = function(modelId) {
        var nluModel = new global.NLUModel(modelId);
        var nluModelGr = nluModel.getGR();
        var parloIntegrator = new global.NLUParloIntegrator(nluModelGr);
        var result = parloIntegrator.getModelStatus();

        var solution = parloIntegrator.getSolution();
        var solutionVersion = solution.getVersion(result.trainedVersion);
        var solutionProps = JSON.parse(solutionVersion.getProperties());
        var version = solutionProps.authoringModel.version;
        var language = solutionProps.authoringModel.language || 'en';
        var confThreshold = solutionProps.authoringModel.confidenceThreshold;
        return {
            id: modelId,
            solutionName: solution.getName(),
            name: nluModelGr.getValue('name'),
            trained_version: result.trainedVersion,
            trained_on: result.lastTrainedOn,
            confidence_threshold: confThreshold,
            version: version,
            language: language,
            sys_policy: nluModelGr.getValue('sys_policy')
        };
    };

    NLUMLSolutionUtil.prototype = {
        initialize: function() {},
        type: 'NLUMLSolutionUtil'
    };
})();
