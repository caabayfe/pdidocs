var MlValidationHelper = Class.create();
MlValidationHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    initialize: function() {
        this.MLBaseConstants = global.MLBaseConstants;
        this.LD = "668619e753220010d1dcddeeff7b125a";
        this.minimum_neighbor = "32ddecd053733300d1dcddeeff7b12c2";
        this.HDBSCAN = "0197031f533210106c61ddeeff7b1293";
    },
    //validates input fields, minimum and maximum number of records for training.
    minmaxValidation: function(table, filter, capability) {
        var validation = true;
        var minNumber = 10000;
        var maxNumber = 300000;
        var errorMsg = "";

        var gr = new GlideRecordSecure(table);
        if (gr.isValidEncodedQuery(filter))
            gr.addEncodedQuery(filter);
        gr.query();
        var inputSize = gr.getRowCount();

        var trainerName = "";
		var minNumberPropName = "";
        switch (capability) {
            case "similarity_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.min_similarity_window_records', 10);
                maxNumber = gs.getProperty('glide.platform_ml.api.max_similarity_window_records', 100000);
                trainerName = gs.getMessage('Similarity');
				minNumberPropName = "glide.platform_ml.api.min_similarity_window_records";
                break;
            case "workflow_similarity_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.min_similarity_window_records', 10);
                maxNumber = gs.getProperty('glide.platform_ml.api.max_similarity_window_records', 100000);
                trainerName = gs.getMessage('Workflow Similarity');
				minNumberPropName = "glide.platform_ml.api.min_similarity_window_records";
                break;
            case "clustering_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.min_clustering_records', 100);
                maxNumber = gs.getProperty('glide.platform_ml.api.max_clustering_records', 100000);
                trainerName = gs.getMessage('Clustering');
				minNumberPropName = "glide.platform_ml.api.min_clustering_records";
                break;
            case "workflow_clustering_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.min_clustering_records', 100);
                maxNumber = gs.getProperty('glide.platform_ml.api.max_clustering_records', 100000);
                trainerName = gs.getMessage('Workflow Clustering');
				minNumberPropName = "glide.platform_ml.api.min_clustering_records";
                break;
            case "classification_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.csv_min_line', 10000);
                maxNumber = gs.getProperty('glide.platform_ml.api.csv_max_line', 300000);
                trainerName = gs.getMessage('Classification');
				minNumberPropName = "glide.platform_ml.api.csv_min_line";
                break;
            case "regression_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.min_regression_records', 10000);
                maxNumber = gs.getProperty('glide.platform_ml.api.max_regression_records', 300000);
                trainerName = gs.getMessage('Regression');
				minNumberPropName = "glide.platform_ml.api.min_regression_records";
                break;
            case "workflow_classification_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.csv_min_line', 10000);
                maxNumber = gs.getProperty('glide.platform_ml.api.csv_max_line', 300000);
                trainerName = gs.getMessage('Workflow Classification');
				minNumberPropName = "glide.platform_ml.api.csv_min_line";
                break;
            case "workflow_regression_trainer":
                minNumber = gs.getProperty('glide.platform_ml.api.min_regression_records', 10000);
                maxNumber = gs.getProperty('glide.platform_ml.api.max_regression_records', 300000);
                trainerName = gs.getMessage('Workflow Regression');
				minNumberPropName = "glide.platform_ml.api.min_regression_records";
                break;
            default:
        }


        if (minNumber <= 0) {
            minNumber = 1;
        }
        if (inputSize < minNumber) {
            errorMsg += gs.getMessage("Recommended setting for solution training requires minimum {0} records. Please use the system property {1} to train with a smaller number. ", [minNumber.toString(), minNumberPropName]);
            validation = false;
        }
        //DEF0096884 : If inputSize is more than max row count, training should happen with latest 'maxNumber' records.
        //if (inputSize > maxNumber) {
        //    errorMsg = gs.getMessage("Select a maximum of {0} records in Step 3 for {1} training. Train the solution after you update the filters in step 3. ", [maxNumber.toString(), trainerName]);
        //    validation = false;
        //}

        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },

    minClusteringRecordsValidation: function(table, filter, capability, minRecords) {
        var validation = true;
        var errorMsg = "";

        var gr = new GlideRecordSecure(table);
        gr.addEncodedQuery(filter);
        gr.query();
        var inputSize = gr.getRowCount();

        if (inputSize <= minRecords) {
            errorMsg += gs.getMessage("Minimum number of records per cluster exceeds the total number of records.");
            validation = false;
        }

        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },

    checkInputTypes: function(table, capability, addedInputFields) {
        var validation = true;
        var errorMsg = "";
        var classificationFieldTypesName = "choice,string,html,translated_html,reference,integer,long,longint,decimal,numeric,float,boolean";
        var classificationFieldTypesLabel = "Choice, String, HTML, Translated HTML, Reference, Integer, Long, Longint, Decimal, Numeric, Float, Boolean";
        var regressionFieldTypesName = "choice,string,html,translated_html,reference,integer,float,longint,decimal";
        var regressionFieldTypesLabel = "Choice, String, HTML, Translated HTML, Reference, Integer, Floating Point Number, Long, Decimal";
        var tableRecord = new GlideRecordSecure(table);
        for (var field in addedInputFields) {
            var element = tableRecord.getElement(addedInputFields[field]);
            var descriptor = element.getED();
            var type = descriptor.getInternalType();
            var choiceType = sn_ml.MLRecordUtil.getFieldType(table, addedInputFields[field]);
            //validating input field types for regression
            if (capability == "regression_trainer") {
                if (!regressionFieldTypesName.includes(type) && !regressionFieldTypesName.includes(choiceType)) {
                    validation = false;
                    errorMsg = gs.getMessage("Input Fields are only supported for {0} types", regressionFieldTypesLabel.toString());
                    break;
                }
            }
            //validating input field types for classification
            if (capability == "classification_trainer") {
                if (!classificationFieldTypesName.includes(type) && !classificationFieldTypesName.includes(choiceType)) {
                    validation = false;
                    errorMsg = gs.getMessage("Input Fields are only supported for {0} types", classificationFieldTypesLabel.toString());
                    break;
                }
            }
        }
        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },

    targetSolThresholdValidation: function(threshold_val) {
        var validation = true;
        var errorMsg = "";
        if (JSUtil.nil(threshold_val) || isNaN(threshold_val) || (threshold_val <= 0) || (threshold_val > 100)) {
            validation = false;
            errorMsg = gs.getMessage("Target Solution Coverage number should be greater than 0 and lesser than or equal to 100");
        }
        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },
    areClusteringFieldsMutuallyExclusive: function(current) {
        var validation = true;
        var errorMsg = "";
        var fields_set = [];
        var total_fields = 0;
        addNewFields = function(item) {
            if (fields_set.indexOf(item) === -1) {
                fields_set.push(item);
            }
        };

        //Add Segmentation field only if use group by is enabled
        if (current.getValue("segmentation_field") && current.getValue("use_segmentation") == 1) {
            var segmentation_fields = current.getValue("segmentation_field").split(",");
            segmentation_fields.forEach(addNewFields);
            total_fields += segmentation_fields.length;
        }

        //Add purity fields only if calculate purity is enabled
        if (current.getValue("purity_fields") && current.getValue("cal_purity") == 1) {
            var purity_fields = current.getValue("purity_fields").split(",");
            purity_fields.forEach(addNewFields);
            total_fields += purity_fields.length;
        }

        var fields = current.getValue("fields").split(",");
        fields.forEach(addNewFields);
        total_fields += fields.length;

        if (fields_set.length < total_fields) {
            validation = false;
            errorMsg = gs.getMessage("Fields, Group By, Purity Fields should not have columns in common");
        }
        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },

    preTrainingValidation: function(capability, current) {
        var validationObj = {
            'validation': true,
            'errorMsg': ""
        };

        //checking entitlements
        validationObj = this.checkEntitlements(capability);
        if (!validationObj.validation) {
            return validationObj;
        }

        switch (capability) {
            case "classification_trainer":
            case "workflow_classification_trainer":
                //Step 1: Verifying the input field types.
                var addedInputFields = current.fields.split(',');
                validationObj = this.checkInputTypes(current.getValue("table"), current.capability.getRefRecord().getValue("value"), addedInputFields);
                if (!validationObj.validation) {
                    return validationObj;
                }

                //Step 2: min max record validation
                validationObj = this.minmaxValidation(current.getValue("table"), current.getValue("filter"), current.capability.getRefRecord().getValue("value"), addedInputFields);
                if (!validationObj.validation) {
                    return validationObj;
                }
                if (new MLGroupbyUtils().isGroupBy(current)) {
                    return {
                        'validation': false,
                        'errorMsg': "Please use APIs to train group-by solutions"
                    };
                }
                validationObj = this.missingEncoderWarningMessage(current);
                if (!validationObj.validation) {
                    return validationObj;
                }

                break;
            case "similarity_trainer":
            case "workflow_similarity_trainer":
                //Step 1 : min max record count validation
                validationObj = this.minmaxValidation(current.getValue("table"), current.getValue("filter"), current.capability.getRefRecord().getValue("value"));
                if (!validationObj.validation) {
                    return validationObj;
                }

                //Step 2: check if word corpus and details should not be empty
                if ((gs.getProperty("glide.platform_ml.api.enable_workflow_similarity") == null) ||
                    (gs.getProperty("glide.platform_ml.api.enable_workflow_similarity") == "false")) {
                    validationObj = this.wordVectorValidation(current);
                    if (!validationObj.validation) {
                        return validationObj;
                    }
                }
                break;
            case "clustering_trainer":
            case "workflow_clustering_trainer":
                //Step 1 : min max record count validation
                validationObj = this.minmaxValidation(current.getValue("table"), current.getValue("filter"), current.capability.getRefRecord().getValue("value"));
                if (!validationObj.validation) {
                    return validationObj;
                }


                //Step 2: check if word corpus and details should not be empty
                //Paris Release - levenshtein distance Advanced parameter or WVC is present not both'
                var solutionDefSysid = current.getUniqueValue();
                var advParam = this.advSolParamRec(solutionDefSysid, this.LD);
                if (!JSUtil.isEmpty(advParam)) {
                    if (JSUtil.nil(current.getValue("word_vector_corpus"))) {
                        var min_neighbors = this.advSolParamRec(solutionDefSysid, this.minimum_neighbor);
                        if (!JSUtil.isEmpty(min_neighbors) && min_neighbors.isValidRecord() && min_neighbors.getValue('user_inputs') == '1') {
                            return validationObj;
                        } else {
                            return {
                                'validation': false,
                                'errorMsg': " For Levenshtein Distance minimum neighbors needs to be 1"
                            };
                        }
                    } else {
                        return {
                            'validation': false,
                            'errorMsg': "Word Vector Corpus and Levenshtein Distance cannot be used together for clustering training"
                        };
                    }
                }

                // Check if fields, group by, purity fields are mutually exclusive.
                validationObj = this.areClusteringFieldsMutuallyExclusive(current);
                if (!validationObj.validation) {
                    return validationObj;
                }

                var hdbscanParam = this.advSolParamRec(solutionDefSysid, this.HDBSCAN);
                if (!JSUtil.isEmpty(hdbscanParam)) {
                    return validationObj;
                }

                if ((gs.getProperty("glide.platform_ml.api.enable_workflow_clustering") == null) ||
                    (gs.getProperty("glide.platform_ml.api.enable_workflow_clustering") == "false")) {
                    validationObj = this.wordVectorValidation(current, ["tfidf"]);
                    if (!validationObj.validation) {
                        return validationObj;
                    }
                }

                validationObj = this.minClusteringRecordsValidation(current.getValue("table"), current.getValue("filter"), current.capability.getRefRecord().getValue("value"), current.getValue("min_records"));
                if (!validationObj.validation) {
                    return validationObj;
                }

                break;
            case "regression_trainer":
                //Step 1: Verifying the input field types.
                var addedInputFields = current.fields.split(',');
                validationObj = this.checkInputTypes(current.getValue("table"), current.capability.getRefRecord().getValue("value"), addedInputFields);
                if (!validationObj.validation) {
                    return validationObj;
                }

                //Step 2: min max record validation
                validationObj = this.minmaxValidation(current.getValue("table"), current.getValue("filter"), current.capability.getRefRecord().getValue("value"), addedInputFields);
                if (!validationObj.validation) {
                    return validationObj;
                }
                if (new MLGroupbyUtils().isGroupBy(current)) {
                    return {
                        'validation': false,
                        'errorMsg': "Please use APIs to train group-by solutions"
                    };
                }
                validationObj = this.missingEncoderWarningMessage(current);
                if (!validationObj.validation) {
                    return validationObj;
                }

                break;
            default:
                return validationObj;
        }
        return validationObj;
    },


    wordVectorValidation: function(record, unsupported_corpus_list) {
        var validation = true;
        var errorMsg = "";
        if (JSUtil.isEmpty(record)) {
            validation = false;
            errorMsg = gs.getMessage("Solution definition record is empty");
            return {
                'validation': validation,
                'errorMsg': errorMsg
            };
        }
        var wvc_gr = record.word_vector_corpus.getRefRecord();
        if (!wvc_gr.isValidRecord()) {
            validation = false;
            errorMsg = gs.getMessage("Word Corpus for solution definition record is empty");
            return {
                'validation': validation,
                'errorMsg': errorMsg
            };
        }

        if (unsupported_corpus_list) {
            if (unsupported_corpus_list.indexOf(wvc_gr.getValue('type')) > -1) {
                return {
                    'validation': false,
                    'errorMsg': gs.getMessage("Unsupported Word Corpus specified: {0}", [wvc_gr.getDisplayValue('type')])
                };
            }
        }

        if (wvc_gr.getValue('type') == 'pretrained') {
            return {
                'validation': validation,
                'errorMsg': errorMsg
            };
        }

        var wvc_content_gr = new GlideRecordSecure(this.MLBaseConstants.ML_WVC_DETAILS);
        wvc_content_gr.addQuery(this.MLBaseConstants.COL_WVC, wvc_gr.getUniqueValue());
        wvc_content_gr.query();
        if (wvc_content_gr.getRowCount() <= 0) {
            validation = false;
            errorMsg = gs.getMessage("Please add word corpus details for the word corpus used");
            return {
                'validation': validation,
                'errorMsg': errorMsg
            };
        }
        while (wvc_content_gr.next()) {
            var hasOneRow = this.hasMinOneRow(wvc_content_gr.getValue("table"), wvc_content_gr.getValue("filter"));
            if (!hasOneRow) {
                validation = false;
                errorMsg = gs.getMessage("'{0}' Word corpus content contains 0 records", wvc_content_gr.name);
                return {
                    'validation': validation,
                    'errorMsg': errorMsg
                };
            }
        }

        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },

    missingEncoderWarningMessage: function(record) {
        var validation = true;
        var warningMsg = "";
        var errorMsg = "";

        var wvc_gr = record.word_vector_corpus;

        var capability = current.capability.getRefRecord().getValue("value");
        if (((capability == "classification_trainer" || capability == "workflow_classification_trainer") && gs.getProperty("glide.platform_ml.api.enable_workflow_classification") == "true") ||
            ((capability == "regression_trainer" || capability == "workflow_regression_trainer") && gs.getProperty("glide.platform_ml.api.enable_workflow_regression") == "true") ||
            ((capability == "clustering_trainer" || capability == "workflow_clustering_trainer") && gs.getProperty("glide.platform_ml.api.enable_workflow_clustering") == "true") ||
            ((capability == "similarity_trainer" || capability == "workflow_similarity_trainer") && gs.getProperty("glide.platform_ml.api.enable_workflow_similarity") == "true")) {
            warningMsg = gs.getMessage("Word corpus input field is disabled in order to provide streamlined user experience and improved performance. Please reach out to your Servicenow Account Executive for more information.");
            return {
                'validation': validation,
                'warningMsg': warningMsg
            };
        }

        if (JSUtil.nil(wvc_gr)) {
            warningMsg = gs.getMessage("Word Corpus for solution definition record is empty. System will attempt to create a word corpus if it identifies atleast one text column in the input data.");
            return {
                'validation': validation,
                'warningMsg': warningMsg
            };
        }
        //STRY50868523 and STRY50868460
        else {
            wvc_gr = wvc_gr.getRefRecord();
            var wvc_type = wvc_gr.getValue('type');

            var gr = new GlideRecordSecure(this.MLBaseConstants.ML_ADVANCED_SOL_SETTINGS);
            gr.addQuery(this.MLBaseConstants.SOL_DEFINITION_REF_FIELD, current.getUniqueValue());
            gr.addQuery("solution_parameters.key", "TF-IDF");
            gr.query();
            if (gr.next()) {
                var solParam = gr.solution_parameters.getRefRecord();
                var key = solParam.key.replace('-', '').toLowerCase();
                if (key !== wvc_type) {
                    validation = false;
                    errorMsg = gs.getMessage("Your word corpus type must match your advanced solution parameter type. Example: If using a TF-IDF word corpus, use the TF-IDF parameter.");
                }
            } else {
                if (wvc_type === "tfidf") {
                    validation = false;
                    errorMsg = gs.getMessage("Your word corpus type must match your advanced solution parameter type. Example: If using a TF-IDF word corpus, use the TF-IDF parameter.");
                }
            }
            return {
                'validation': validation,
                'errorMsg': errorMsg
            };
        }
    },

    hasMinOneRow: function(table, encodedQuery) {
        var hasOneRow = false;
        if (table) {
            gr = new GlideRecordSecure(table);
            if (encodedQuery)
                gr.addEncodedQuery(encodedQuery);
            gr.setLimit(1);
            gr.query();
            hasOneRow = gr.getRowCount() > 0;
        }
        return hasOneRow;
    },

    advSolParamRec: function(sol_def_sys_id, key) {
        var advSolParamRec = {};
        var gr = new GlideRecordSecure("ml_advanced_solution_settings");
        gr.addQuery("ml_capability_definition", sol_def_sys_id);
        gr.addQuery("solution_parameters", key);
        gr.query();
        if (gr.next()) {
            return gr;
        }
        return advSolParamRec;
    },

    checkEntitlements: function(capability) {
        var validation = false;
        var errorMsg = "";
        var entitlementResult = sn_ml.MLEntitlementUtil.hasEntitlement(capability);

        if (entitlementResult.hasEntitlement()) {
            validation = true;
        } else {
            errorMsg = entitlementResult.getMessage();
        }
        return {
            'validation': validation,
            'errorMsg': errorMsg
        };
    },


    type: 'MlValidationHelper'
});
