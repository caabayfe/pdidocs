var IntentDiscoveryUtilOrlando = Class.create();
IntentDiscoveryUtilOrlando.prototype = {
    initialize: function() {
        this.NLU_SYS_ID = "b4ddf73453c73300d1dcddeeff7b1288";
        this.CLASSIFICATION_SYS_ID = "95ca97b453873300d1dcddeeff7b120f";
    },
	
    createJob: function(label, table, field, encodedQuery, extraOpts) {
        if (!field.includes("sys_id")) {
            field = field + ",sys_id";
        }
        var opts = {
            "capability": this.NLU_SYS_ID,
            "label": label,
            "language": "en",
            "targetTable": table,
            "input_fields": field,
            "filter": encodedQuery,
        };
        //user fields needs to append it to "field" so that data for these columns is sent to the training server.
        if ((extraOpts || {}).user_fields && extraOpts.user_fields != null) {
            opts.input_fields = opts.input_fields + "," + extraOpts["user_fields"].join(",");
        }
        var sysDefId = this._createSolutionDef(opts);
        if (sysDefId.length > 0) {
            var res = new sn_ml.TrainingRequest().submitForTraining(sysDefId);
            gs.info("Training Request Submitted for Intent Discovery" + JSON.stringify(res));
            if (JSON.stringify(res).length > 0) {
                var solutionName = this._setSolutionInputField(sysDefId, opts.input_fields, opts);
                if (solutionName.length > 0) {
                    this._updateCapability(solutionName);
                    return solutionName;
                } else {
                    gs.error("Failed to create solution name:" + solutionName);
                }
            } else {
                gs.error("Failed to create training request.");
            }
        } else {
            gs.error("Failed to create solution def.");
        }
        return null;
    },

    rerun: function(solutionDefId, solutionDefRec, reportDefRec) {
        // reset capability to NLU from classification. 
        // queue job as NLU
        solutionDefRec.setValue("capability", this.NLU_SYS_ID);
        solutionDefRec.update();
        var res = new sn_ml.TrainingRequest().submitForTraining(solutionDefId);
        gs.info("Training Request Submitted for Intent Discovery" + JSON.stringify(res));
        if (JSON.stringify(res).length > 0) {

            var field = solutionDefRec.getValue("fields");
            if (!field.includes("sys_id")) {
                field = field + ",sys_id";
            }
            var opts = {
                input_fields: field,
                filter: solutionDefRec.getValue("filter"),
            };
            var solutionName = this._setSolutionInputField(solutionDefId, opts.input_fields, opts);
            if (solutionName.length > 0) {
                this._updateCapability(solutionName);
                return {
                    status: {
                        solution: solutionName,
                        name: reportDefRec.getValue("name"),
                    },
                    error: null
                };
            } else {
                return {
                    status: null,
                    error: "Failed to create solution name:" + solutionName
                };
            }
        } else {
            return {
                status: null,
                error: "Failed to create training request."
            };
        }
    },

    getOptions: function(extraOpts, reportDef) {
        return extraOpts;
    },
	
    _createSolutionDef: function(opts) {
        var def = new GlideRecord("ml_capability_definition_base");
        var sName = opts.label + gs.generateGUID();
        def.initialize();
        def.setValue("capability", opts.capability);
        def.setValue("solution_label", sName);
        def.setValue("solution_name", sName);
        def.setValue("dataset_language", opts.language);
        def.setValue("table", opts.targetTable);
        def.setValue("training_frequency", "run_once");
        def.setValue("fields", opts.input_fields);
        def.setValue("input_fields", opts.input_fields);
		if (opts.domain) {
			def.setValue("sys_domain", opts.domain);
		}
        var rowCount = this._getInputRowCount(opts);
        // Will get set later no matter what
        // For instances with lots of data this is needed before
        // Submitting training request
        if (opts.filter && rowCount >= 10000) {
            def.setValue("filter", opts.filter);
        }
        var sysID = def.insert();
        current.solution_definition = sysID;
        current.update();
        return sysID;
    },
    _setSolutionInputField: function(solutionDefSysId, inputFields, opts) {
        var def = new GlideRecord("ml_solution");
        def.addQuery("ml_capability_definition", solutionDefSysId);
        def.query();
        def.next();
        var solutionName = def.solution_name.toString();
        if (solutionName.toString().length > 0) {
            def.setValue("input_fields", inputFields);
            def.setValue("capability", "classification");
            if (opts.filter) {
                def.setValue("input_filter", opts.filter);
            }
            def.update();
            return solutionName;
        } else {
            gs.error("Could not find solution for using name for id:" + solutionDefSysId);
        }
        return "";
    },
    _updateCapability: function(solutionName) {
        var def = new GlideRecord("ml_capability_definition_base");
        def.addQuery("solution_name", solutionName);
        def.query();
        def.next();
        gs.info("Found solution name during update: " + def.solution_name);
        if (def.solution_name) {
            def.setValue("capability", this.CLASSIFICATION_SYS_ID);
            def.update();
        } else {
            gs.error("Failed to Update Solution Capability.");
        }
    },
    _getInputRowCount: function(opts) {
        var gr = new GlideRecord(opts.targetTable);
        gr.addEncodedQuery(opts.filter);
        gr.query();
        var count = gr.getRowCount();
        gs.info('row count is :' + count);
        return count;
    },

    getSolution: function(solutionName) {
        return sn_ml.NLUSolutionStore.get(solutionName);
    },

    type: 'IntentDiscoveryUtilOrlando'
};
