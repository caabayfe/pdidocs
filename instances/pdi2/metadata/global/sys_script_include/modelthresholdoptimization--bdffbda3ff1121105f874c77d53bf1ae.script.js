var ModelThresholdOptimization = Class.create();
ModelThresholdOptimization.prototype = {
    initialize: function(modelName, modelType) {
        this.modelName = modelName;
        this.modelType = modelType;
        this.generalQuery = "^model_name=" + this.modelName + "^model_type=" + this.modelType;
        this.table = "ml_model_threshold_optimization_metric";
        this.labelNames = this._getLabelNames();
    },

    _getNluModelInfo: function() {
        jsonValues = {};
        var modelStatus = NLUStudioService.getModelStatusByName(this.modelName);
        if (modelStatus.state == 'published') {
            var grM = new GlideRecord("sys_nlu_model");
            grM.addEncodedQuery("name=" + this.modelName);
            grM.query();
            if (grM.next()) {
                confidenceThreshold = grM.confidence_threshold;
                var grI = new GlideRecord("sys_nlu_intent");
                grI.addEncodedQuery("model.name=" + this.modelName);
                grI.query();
                while (grI.next()) {
                    jsonValues[grI.name] = confidenceThreshold.toString();
                }
            } else {
                gs.error("Could not find the published model (" + this.modelName + ") in the sys_nlu_model table!");
            }
        } else {
            gs.error("Could not find the nlu model name (" + this.modelName + "). Is it published?");
        }
        return jsonValues;
    },

    /* method which insert default threshold values to the main table. In this case, the version is set to 0.
	   Version 0 should have all labels.
	*/
    insertDefaultModelInfo: function(targetSolutionSysId) {
        if (targetSolutionSysId === undefined) {
            targetSolutionSysId = null;
        }
        jsonValues = {};
        switch (this.modelType) {
            case 'NLU':
                jsonValues = this._getNluModelInfo();
                if (Object.keys(jsonValues).length == 0) {
                    return;
                }
                break;
            default:
                gs.info("Unsupported type: " + this.modelType);
                return;
        }
        var grT = new GlideRecord(this.table);
        grT.initialize();
        grT.setValue('proposed_values', JSON.stringify(jsonValues));
        grT.setValue('quality_metrics', '{}');
        grT.setValue('skipped', false);
        grT.setValue('version', 0);
        grT.setValue('active', true);
        grT.setValue('fine_tuned_type', 'default');
        grT.setValue('admin_approved', 'no');
        grT.setValue('notes', "Model overall threshold value is set as a default one.");
        grT.setValue('meta_data', '{}');
        grT.setValue('model_name', this.modelName);
        grT.setValue('model_type', this.modelType);
        grT.setValue('fine_tuned_ml_solution', null);
        grT.setValue('target_ml_solution', targetSolutionSysId);
        var insert = grT.insert();
        if (insert != null)
            gs.info("The default value is inserted!");
    },

    /* method which return back the list of label names by looking at version 0.
    */
    _getLabelNames: function() {
        var labelNames = [];
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=0" + this.generalQuery);
        grT.query();
        if (grT.next()) {
            var labelsObject = JSON.parse(grT.getValue('proposed_values'));
            for (labelName in labelsObject) {
                labelNames.push(labelName);
            }
        } else {
            gs.error('Could not find default records in Model Threshold Optimization Metric table!');
        }
        return labelNames;
    },

    /* method which return back the json of labels and scores for a specific version.
    */
    getLabelScoresByVersion: function(version) {
        var labelScores = {};
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=" + version + this.generalQuery);
        grT.query();
        if (grT.next()) {
            labelScores = JSON.parse(grT.getValue('proposed_values'));
        } else {
            gs.error("Could not find version " + version + " for " + this.modelName + "(type: " + this.modelType + ") in the table!");
        }
        return labelScores;
    },

    /* method which return back the json of labels and scores for a specific valid version.
       Valid version is a previous version which is neither admin pending nor skipped.
    */
    getValidLabelScoresByVersion: function(version) {
        var labelScores = {};
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=" + version + "^ORversion=NULL^skipped=false^admin_approved!=pending" + this.generalQuery);
        grT.query();
        if (grT.next()) {
            labelScores = JSON.parse(grT.getValue('proposed_values'));
        } else {
            gs.error("Could not find version " + version + " for " + this.modelName + "(type: " + this.modelType + ") with false skipped and/or non-pending approval in the table!");
        }
        return labelScores;
    },

    /* method which return back the threshold default value by looking at version 0.
    */
    getDefaultThreshold: function() {
        var defaultThreshold = 0;
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=0" + this.generalQuery);
        grT.query();
        if (grT.next()) {
            defaultThreshold = JSON.parse(grT.getValue('proposed_values'))[this.labelNames[0]];
        }
        return defaultThreshold;
    },

    /* method which find missed labels in its json input and add them with previous valid version score.
    */
    _getMissedLabels: function(labelScores, version) {
        var labelNames = this.labelNames;
        var labelLength = labelNames.length;
        for (key in labelScores) {
            var index = labelNames.indexOf(key);
            if (index > -1) {
                labelNames.splice(index, 1);
            }
        }
        var foundVersion = false;
        while (version != 0 && foundVersion == false) {
            version--;
            var validLabelScoresByVersion = this.getValidLabelScoresByVersion(version);
            if (Object.keys(validLabelScoresByVersion).length == labelLength) {
                foundVersion = true;
                for (labelName in validLabelScoresByVersion) {
                    if (labelNames.indexOf(labelName) != -1) {
                        labelScores[labelName] = validLabelScoresByVersion[labelName];
                    }
                }
            }
        }
        return labelScores;
    },

    /* method which return back the current json of labels and scores used by the model.
    */
    getLabelScores: function() {
        var labelScores = {};
        var version = 0;
        var missedLabels = false;
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("active=true" + this.generalQuery);
        grT.setLimit(1);
        grT.orderByDesc('version');
        grT.query();
        if (grT.next()) {
            version = grT.getValue('version');
            labelScores = JSON.parse(grT.getValue('proposed_values'));
            if (Object.keys(labelScores).length != this.labelNames.length) {
                missedLabels = true;
            }
        }
        if (missedLabels == true) {
            labelScores = this._getMissedLabels(labelScores, version);
        }
        for (item in labelScores) {
            labelScores[item] = parseFloat(labelScores[item]);
        }
        return labelScores;
    },

    /* method which return back the json of labels and scores for the latest version.
    */
    getLatestLabelScores: function() {
        var version = this.getLatestVersion();
        return this.getLabelScoresByVersion(version);
    },

    /* method which return back the json value of the json file in the sys_attachment table.
    */
    readSysAttachmentFile: function(attachmentSysId) {
        var jsonObject = [];
        var gr = new GlideRecord("sys_attachment");
        if (gr.get(attachmentSysId)) {
            try {
                var ga = new GlideSysAttachment();
                fileContent = ga.getContent(gr);
                if (fileContent === undefined) {
                    throw new TypeError("Undefined file content!");
                }
                jsonObject = JSON.parse(fileContent);
            } catch (error) {
                gs.error(error);
                gs.info("Try another method to read sys_attachment table ...");
                try {
                    var StringUtil = new GlideStringUtil();
                    var ga = new GlideSysAttachment();
                    var bytes = ga.getBytes(gr);
                    var jsonString = StringUtil.base64Decode(StringUtil.base64Encode(bytes));
                    jsonObject = JSON.parse(jsonString);
                } catch (error) {
                    gs.error(error);
                }
            }
        } else {
            gs.error("Could not find sys_attachment sys_id!");
        }
        return jsonObject;
    },

    /* method which return back the version which is active and used by model.
    */
    getActiveVersion: function() {
        var version = -1;
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("active=true" + this.generalQuery);
        grT.setLimit(1);
        grT.query();
        if (grT.next()) {
            version = grT.getValue('version');
        } else {
            gs.error("No active version found!");
        }
        return version;
    },

    /* method to set a version active.
    */
    setActiveVersion: function(version) {
        var updated = false;
        var currentActiveVersion = this.getActiveVersion();
        var grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=" + version + this.generalQuery);
        grT.query();
        if (grT.next()) {
            grT.setValue('active', true);
            updated = grT.update();
        }
        if (updated) {
            grT = new GlideRecord(this.table);
            grT.addEncodedQuery("version=" + currentActiveVersion + this.generalQuery);
            grT.query();
            if (grT.next()) {
                grT.setValue('active', false);
                grT.update();
            }
        }
    },

    /* method which return back the latest version.
    */
    getLatestVersion: function() {
        var version = -1;
        var count = new GlideAggregate(this.table);
        count.addEncodedQuery("model_name=" + this.modelName + "^model_type=" + this.modelType);
        count.setGroup(false);
        count.addAggregate('MAX', 'version');
        count.query();
        if (count.next()) {
            var max = count.getAggregate('MAX', 'version');
            if (max) {
                version = parseInt(max);
            }
        }
        return version;
    },

    /* method which return back the new version.
    */
    getNewVersion: function() {
        var version = this.getLatestVersion();
        return version + 1;
    },

    /* method which return back the attachment sysid applied to a specific version.
    */
    findAttachmentSysId: function(version, jsonFileNameWithoutExtension) {
        var attachmentSysId = null;
        grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=" + version + this.generalQuery);
        grT.query();
        if (grT.next()) {
            attachmentSysId = this.findAttachmentSysIdBySolutionSysId(grT.getValue('solution'), jsonFileNameWithoutExtension);
        } else {
            gs.error("Could not find version" + version + " for " + this.modelName + "(type: " + this.modelType + ") to find its related sys_attachment sys_id!");
        }
        return attachmentSysId;
    },

    /* method which return back the attachment sysid by solution sysid.
    */
    findAttachmentSysIdBySolutionSysId: function(solutionSysId, jsonFileNameWithoutExtension) {
        var grM = new GlideRecord("ml_model_artifact");
        grM.addEncodedQuery("solution=" + solutionSysId + "^model_id=" + jsonFileNameWithoutExtension + ".json");
        grM.query();
        if (grM.next()) {
            var grS = new GlideRecord("sys_attachment");
            grS.get("table_sys_id", grM.sys_id);
            if (grS) {
                attachmentSysId = grS.sys_id;
            }
        } else {
            gs.error("Could not find the artifact in ml_model_artifact table!");
        }
        return attachmentSysId;
    },

    /* method which call gs.sleep and can be used in scoped app.
    */
    sleep: function(time) {
        gs.sleep(time);
    },

    /* Method to insert record to the main table
    	inputs:
    		jsonObject: json
    			this input should have the below keys:
    				'tuned_thresholds' : json -> The value will be saved in 'proposed_values' field.
    				'quality_metrics' : json -> The value will be saved in 'quality_metrics' field.
    				'improved' : boolean -> The invert value will be saved in 'skipped' field. It shows if quality metrics are improved after tunning
    				'fine_tuned_type' : string -> The value will be saved in 'fine_tuned_type' field. The type can be 'default', 'feedback', 'label'
    				'admin_approved' : string -> The value will be saved in 'admin_approved' field. It shows if admin has approved these threshold values ('yes', 'no', 'pending')
    				'fine_tuned_ml_solution' : ml_solution reference -> The value will be saved in 'fine_tuned_ml_solution' field.
    				'target_ml_solution' : ml_solution reference -> The value will be saved in 'target_ml_solution' field.
    	outputs:
    		None 
    */
    insertRecord: function(jsonObject) {
        var tunedThresholds = jsonObject['tuned_thresholds'];
        var qualityMetrics = jsonObject['quality_metrics'];
        var skipped = !jsonObject['improved'];
        var fineTunedType = jsonObject['fine_tuned_type'];
        var adminApproved = jsonObject['admin_approved'];
        var fineTunedSolutionSysId = jsonObject['fine_tuned_ml_solution'];
        var targetSolutionSysId = jsonObject['target_ml_solution'];
        var version = this.getNewVersion();
        if (Object.keys(tunedThresholds).length != this.labelNames.length) {
            tunedThresholds = this._getMissedLabels(tunedThresholds, version);
        }
        var grT = new GlideRecord(this.table);
        grT.initialize();
        grT.setValue('proposed_values', JSON.stringify(tunedThresholds));
        grT.setValue('quality_metrics', JSON.stringify(qualityMetrics));
        grT.setValue('skipped', skipped);
        grT.setValue('version', version);
        grT.setValue('active', false);
        grT.setValue('fine_tuned_type', fineTunedType);
        grT.setValue('admin_approved', adminApproved);
        grT.setValue('notes', "");
        grT.setValue('meta_data', JSON.stringify(jsonObject));
        grT.setValue('model_name', this.modelName);
        grT.setValue('model_type', this.modelType);
        grT.setValue('fine_tuned_ml_solution', fineTunedSolutionSysId);
        grT.setValue('target_ml_solution', targetSolutionSysId);
        var insert = grT.insert();
        if (insert != null) {
            gs.info("The Record for version " + version + " inserted!");
            if (fineTunedType == 'feedback' && !skipped) {
                this.setActiveVersion(version);
            }
        }
    },

    /* method which apply admin approval to a specific version. If Admin approves the version, it will be active.
    */
    setAdminApproval: function(approval, version) {
        value = 'no';
        found = false;
        if (approval) {
            value = 'yes';
        }
        grT = new GlideRecord(this.table);
        grT.addEncodedQuery("version=" + version);
        grT.query();
        if (grT.next()) {
            if (grT.getValue('admin_approved') == 'pending') {
                grT.setValue('admin_approved', value);
                grT.update();
                if (value == 'yes') {
                    this.setActiveVersion(version);
                }
                found = true;
            }
        }
        if (!found) {
            gs.error("Could not find the pending version for Admin Approval");
        }
    },

    type: 'ModelThresholdOptimization'
};
