var SOWTaskIntelligenceAjaxHelper = Class.create();
SOWTaskIntelligenceAjaxHelper.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getPredictionResults: function(sysId, tableName, updatedFields) {
        sysId = sysId || this.getParameter('sysparm_sys_id');
        tableName = tableName || this.getParameter('sysparm_table_name');
        var results = [];

        if (!gs.nil(sysId) && !gs.nil(tableName)) {
          // Security check to check if record exists
          var _gr = new GlideRecordSecure(tableName);

          var predictionsByFeature = new GlideScriptedExtensionPoint().getExtensions(SOWTaskIntelligenceConstants.UI_EXTENSION_POINT);
          for (var i = 0; i < predictionsByFeature.length; i++) {
              if (predictionsByFeature[i].handles(tableName, sysId) && predictionsByFeature[i].isFeatureEnabled()) {
                    try {
                        var result = predictionsByFeature[i].getPredictions(sysId, tableName, updatedFields);
                        if (result) {
                            results.push(result);
                        }
                    } catch (e) {
                        gs.error("Error in getPredictions" + e);
                    }

              }
          }
        }
        return JSON.stringify(results);
    },

    execute: function(input) {
        var results = [];
        var fieldsToMonitor = [];
        var sysId = input["sysId"];
        var tableName = input["table"];
	var updatedFields = input["updatedFields"];

        if (!gs.nil(sysId) && !gs.nil(tableName)) {
            try {
                var result = JSON.parse(this.getPredictionResults(sysId, tableName, updatedFields));
                if (!gs.nil(result)) {
                    for (var i = 0; i < result.length; i++) {
                        var predictionsResult = result[i];
                        if (!(gs.nil(predictionsResult) ||
                                gs.nil(predictionsResult.predictionResults) ||
                                predictionsResult.predictionResults.length <= 0
                            )) {
                            for (var j = 0; j < predictionsResult.predictionResults.length; j++) {
                                var uiDisplay = predictionsResult.predictionResults[j];
                                results.push(uiDisplay);
                            }
                        }
                        if (predictionsResult.fieldsToMonitor && predictionsResult.fieldsToMonitor.length > 0)
                            fieldsToMonitor = fieldsToMonitor.concat(predictionsResult.fieldsToMonitor);
                    }
                }
            } catch (ex) {
                gs.error("Error in executing Task intelligence forms: {0}", ex);
            }
        }
        if (fieldsToMonitor.length > 0)
            fieldsToMonitor = this.removeDuplicates(fieldsToMonitor);
        var output = {
            "predictionResults": results,
            "fieldsToMonitor": fieldsToMonitor
        };

        return output;
    },

    removeDuplicates: function(fieldsToMonitor) {
        fieldsToMonitor = fieldsToMonitor.reduce(function(a, b) {
            if (a.indexOf(b) < 0) a.push(b);
            return a;
        }, []);
        return fieldsToMonitor;
    },

    type: 'SOWTaskIntelligenceAjaxHelper'
});
