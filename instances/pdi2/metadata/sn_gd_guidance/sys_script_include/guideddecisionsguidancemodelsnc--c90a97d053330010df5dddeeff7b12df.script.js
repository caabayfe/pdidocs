var GuidedDecisionsGuidanceModelSNC = Class.create();
GuidedDecisionsGuidanceModelSNC.prototype = {
    initialize: function() {
        this.constantUtil = new sn_gd_guidance.GuidanceConstantsSNC;
        this.GUIDANCE_TABLE = 'ga_guidance';
        this.GUIDANCE_HISTORY_TABLE = 'ga_guidance_history';
        this.GUIDANCE_INSTANCE_EXECUTION_TABLE = 'ga_guidance_instance_execution';
        this.GUIDANCE_INPUT_TABLE = 'ga_guidance_input';
        this.GUIDANCE_OUTPUT_TABLE = 'ga_guidance_output';
        this.GUIDANCE_COMPONENT_TABLE = 'ga_guidance_component';
        this.GUIDANCE_ACTION_TABLE = 'ga_guidance_action';
        this.COL_COMPLETION_MESSAGE = 'completion_message';
        this.COL_ACTION_TAKEN = 'action_taken';
        this.COL_ACTION_BEHAVIOUR = 'action_behaviour';
        this.COL_GUIDANCE_INSTANCE_EXECUTION = 'guidance_instance_execution';
        this.DEFAULT_GUIDANCE_COMPONENT = 'sn-guidance-card-default';
        this.DEFAULT_NOCODE_GUIDANCE_COMPONENT = 'sn-guidance-default-nocode-experience';
        this.NEW_VERSION = "new";
        this.OLD_VERSION = "old";
        this.VAR__M_GA_GUIDANCE_INPUT_ = 'var__m_ga_guidance_input_';
        this.VAR__M_GA_GUIDANCE_OUTPUT_ = 'var__m_ga_guidance_output_';
        this.ResultEnum = {
            "Success": 1,
            "InvalidArguments": 2
        };
        this.guidanceUtils = new sn_gd_guidance.GuidedDecisionsGuidanceUtil();
        this.CONTEXTUAL_SIDE_PANEL = 'contextual_side_panel';
        this.COL_RECOMMENDER = 'recommender';
        this.COL_RECOMMENDED_BY = 'recommended_by';
        this.DEFAULT_NOCODE_GUIDANCE_MACROPONENT = "e592281169ff66772cbf3f64170fb133";
        this.INPUTS = 'INPUTS';
        this.OUTPUTS = 'OUTPUTS';
        this.GUIDANCE_HISTORY_STATE_IN_ERROR = 'in_error';
        this.GUIDANCE_HONOR_SUBFLOW = 'sn_gd_guidance.guidance_honor_subflow';
        this.DATE_TIME_TYPES = [
            'glide_date_time',
            'glide_date',
            'date',
            'datetime',
            'due_date'
        ];
    },

    createGuidanceInstanceExecutionRecord: function(guidanceProvided, guidanceInputs) {
        var guidanceInstanceExecutionGr = new GlideRecord(this.GUIDANCE_INSTANCE_EXECUTION_TABLE);
        guidanceInstanceExecutionGr.guidance = guidanceProvided;
        if (guidanceInputs !== null) {
            for (var inputName in guidanceInputs) {
                guidanceInstanceExecutionGr.guidance_inputs[inputName] = guidanceInputs[inputName];
                var type = !gs.nil(guidanceInstanceExecutionGr.guidance_inputs[inputName]) ? guidanceInstanceExecutionGr.guidance_inputs[inputName].getED().getInternalType() : '';
                if (this.DATE_TIME_TYPES.indexOf(type) !== -1) {
                    var gdt = new GlideDateTime();
                    gdt.setDisplayValue(guidanceInputs[inputName]);
                    guidanceInstanceExecutionGr.guidance_inputs[inputName] = gdt.getValue();
                }
            }
        }
        return guidanceInstanceExecutionGr.insert();
    },

    guidanceHistoryExists: function(recommendedBy, recommender, guidanceProvided, guidanceInputs) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery('recommended_by', recommendedBy);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            return guidanceHistoryGr.sys_id;
        }
        return false;
    },

    guidanceHistoryExistsInWaitingState: function(executionIds) {
        var guidanceExistsInWaitingState = true;
        var guidanceHistoryGr = new GlideRecord(this.constantUtil.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery("recommended_by", "IN", executionIds);
        guidanceHistoryGr.addQuery('recommender', this.constantUtil.DECISION_TREE_EXECUTION_TABLE);
        guidanceHistoryGr.addQuery('state', this.constantUtil.STATE_WAITING);
        guidanceHistoryGr.query();
        if (!guidanceHistoryGr.hasNext())
            guidanceExistsInWaitingState = false;
        return guidanceExistsInWaitingState;
    },

    createGuidanceHistoryRecord: function(recommendedBy, recommender, guidanceProvided, guidanceInputs) {
        var guidanceInstanceExecutionId = this.createGuidanceInstanceExecutionRecord(guidanceProvided, guidanceInputs);
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.recommended_by = recommendedBy;
        guidanceHistoryGr.recommender = recommender;
        guidanceHistoryGr.guidance_provided = guidanceProvided;
        guidanceHistoryGr.guidance_instance_execution = guidanceInstanceExecutionId;
        if (guidanceInputs !== null) {
            for (var inputName in guidanceInputs) {
                guidanceHistoryGr.guidance_inputs[inputName] = guidanceInputs[inputName];
                var type = !gs.nil(guidanceHistoryGr.guidance_inputs[inputName]) ? guidanceHistoryGr.guidance_inputs[inputName].getED().getInternalType() : '';
                if (this.DATE_TIME_TYPES.indexOf(type) !== -1) {
                    var gdt = new GlideDateTime();
                    gdt.setDisplayValue(guidanceInputs[inputName]);
                    guidanceHistoryGr.guidance_inputs[inputName] = gdt.getValue();
                }
            }
        } else {
            guidanceHistoryGr.state = this.GUIDANCE_HISTORY_STATE_IN_ERROR;
        }
        return guidanceHistoryGr.insert();
    },

    getParsedMessage: function(parameterizedGuidanceMsg, inputObject) {
        if (parameterizedGuidanceMsg) {
            var pattern = /\$\{([a-z0-9_.-?]*)\}/gi; //${?};
            var results = parameterizedGuidanceMsg.match(pattern);
            var fieldProps;
            if (results) {
                for (var index = 0; index < results.length; index++) {
                    var displayValue, result = results[index];
                    var variable = result.substring(result.lastIndexOf("{") + 1, result.lastIndexOf("}"));
                    fieldProps = this.getFieldProps(variable, inputObject);
                    if (fieldProps.displayValue)
                        parameterizedGuidanceMsg = parameterizedGuidanceMsg.replace(result, fieldProps.displayValue);
                    else
                        parameterizedGuidanceMsg = parameterizedGuidanceMsg.replace(result, "");
                }
            }
        }
        return parameterizedGuidanceMsg.toString();
    },

    getFieldProps: function(variable, inputObject) {
        var displayValue, labelValue, fieldType, fieldProps = {},
            refProps, internalValue;
        var firstDotIndex = variable.indexOf(".");
        if (firstDotIndex != -1) {
            var inputName = variable.substring(0, firstDotIndex);
            var dotwalkPath = variable.substring(firstDotIndex + 1, variable.length);
            displayValue = inputObject[inputName].getDisplayValue(dotwalkPath);
            labelValue = inputObject[inputName].getElement(dotwalkPath).getLabel();
            fieldType = inputObject[inputName].getElement(dotwalkPath).getED().getInternalType();
            internalValue = inputObject[inputName].getValue(dotwalkPath);
            if (fieldType === 'reference') {
                refProps = {
                    table: inputObject[inputName].getElement(dotwalkPath).getReferenceTable(),
                    sys_id: inputObject[inputName].getElement(dotwalkPath) + ''
                };
            }
        } else {
            if (gs.nil(inputObject[variable].sys_id)) {
                internalValue = inputObject[variable];
                displayValue = inputObject[variable];
                labelValue = inputObject['inputLabelMap'][variable];
            } else {
                inputName = variable;
                internalValue = inputObject[inputName].getValue();
                displayValue = inputObject[inputName].getDisplayValue();
                labelValue = inputObject['inputLabelMap'][variable];
                fieldType = 'reference';
                refProps = {
                    table: inputObject[inputName].getTableName(),
                    sys_id: inputObject[inputName].getUniqueValue()
                };
            }
        }
        fieldProps['internalValue'] = internalValue;
        fieldProps['displayValue'] = displayValue;
        fieldProps['labelValue'] = labelValue;
        fieldProps['fieldType'] = fieldType;
        fieldProps['refProps'] = refProps;
        return fieldProps;
    },

    getformDetails: function(sys_id, type) {
        var guidanceFormGr;
        if (type == this.INPUTS)
            guidanceFormGr = new GlideRecord(this.GUIDANCE_INPUT_TABLE);
        else if (type == this.OUTPUTS)
            guidanceFormGr = new GlideRecord(this.GUIDANCE_OUTPUT_TABLE);

        guidanceFormGr.addQuery('model_id', sys_id);
        guidanceFormGr.orderBy('order');
        guidanceFormGr.query();
        var guidanceFormFields = {};
        while (guidanceFormGr.next()) {
            var guidanceFieldName = guidanceFormGr.element;
            guidanceFormFields[guidanceFieldName] = this.getGuidanceFormFields(guidanceFormGr, type);
        }
        return guidanceFormFields;
    },
    getGuidanceFormFields: function(formGr, type, defvalues) {
        var formLabel;
        if (type == this.INPUTS)
            formLabel = this.getTranslatedFieldValue(formGr, this.VAR__M_GA_GUIDANCE_INPUT_);
        else if (type == this.OUTPUTS)
            formLabel = this.getTranslatedFieldValue(formGr, this.VAR__M_GA_GUIDANCE_OUTPUT_);

        var fieldMetaData = {
            id: formGr.sys_id + '',
            label: formLabel + '',
            maxLength: formGr.max_length + '',
            hint: formGr.hint + '',
            name: formGr.element + '',
            isFormField: formGr.is_form_field == true ? true : false,
            recordValue: {
                displayValue: defvalues ? defvalues.displayValue : '',
                value: defvalues ? defvalues.value : ''
            },
            dictionary: {
                type: formGr.internal_type + '',
                typeLabel: formGr.getDisplayValue('internal_type'),
                dependentField: null,
                dependentTable: null,
                name: formGr.element + '',
                label: formLabel + '',
                canWrite: true,
                canRead: true,
                internalType: formGr.internal_type + '',
                isMandatory: formGr.mandatory == true ? true : false,
                isReadonly: formGr.read_only == true ? true : false,

                attributes: [{
                    name: "edge_encryption_enabled",
                    value: true
                }]
            }
        };

        if (formGr.internal_type == "choice")
            this.addChoiceFields(formGr, fieldMetaData);
        if (formGr.internal_type == "reference") {
            this.addReferencFields(formGr, fieldMetaData);
            this.setDeclarativeActions(fieldMetaData);
        }
        return fieldMetaData;
    },

    // parsing preview fields of guidance which use data pill picker
    getParsedMessageFromGuidanceInputs: function(parameterizedMessage, inputObject) {
        if (parameterizedMessage) {
            var pattern = /(\{{[a-z0-9_.-?]*}})/gi; //{{?}}
            var pattern1 = /(\{{gi[a-z0-9_.-?]*)/gi; //{{gi
            var results = parameterizedMessage.match(pattern);
            var expr_start = "{{gi";
            var expr_end = "}}";
            if (results) {
                for (var index = 0; index < results.length; index++) {
                    var displayValue, result = results[index];
                    var variable = result.substring(expr_start.length + 1, result.lastIndexOf(expr_end));
                    fieldProps = this.getFieldProps(variable, inputObject);
                    if (fieldProps.displayValue)
                        parameterizedMessage = parameterizedMessage.replace(result, fieldProps.displayValue);
                    else
                        parameterizedMessage = parameterizedMessage.replace(result, "");
                }
            }

            var incompleteParsedInput = parameterizedMessage.match(pattern1);
            if (incompleteParsedInput) {
                parameterizedMessage = parameterizedMessage.replace(incompleteParsedInput, "");
            }
        }
        return parameterizedMessage;
    },

    getGuidanceMessage: function(guidanceHistoryGr) {
        var parameterizedGuidanceMsg = guidanceHistoryGr.guidance_provided.guidance_message;
        var inputObject = {};

        try {
            if (guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION && guidanceHistoryGr.guidance_instance_execution)
                inputObject = this.guidanceUtils.createGuidanceInputObject(guidanceHistoryGr.guidance_instance_execution.guidance_inputs);
            else
                inputObject = this.guidanceUtils.createGuidanceInputObject(guidanceHistoryGr.guidance_inputs);

            return this.getParsedMessage(parameterizedGuidanceMsg, inputObject);
        } catch (err) {
            gs.error("Error parsing guidance message: " + JSON.stringify(err));
            return "";
        }
    },

    createGuidanceFromHistory: function(guidanceHistoryGr) {
        if (!this.guidanceUtils.userHasReadAccess(guidanceHistoryGr[this.constantUtil.COL_GUIDANCE_INSTANCE_EXECUTION], this.constantUtil.COL_GUIDANCE_INPUTS))
            return false;
        var guidanceComponentGr = new GlideRecord(this.GUIDANCE_COMPONENT_TABLE);
        guidanceComponentGr.get('guidance', guidanceHistoryGr.guidance_provided);
        var guidanceProps = this.getGuidanceProps(guidanceHistoryGr, guidanceComponentGr);
        var guidanceActions = this.getGuidanceActions(guidanceHistoryGr);
        var actionTakenData = this.getActionTakenData(guidanceHistoryGr);
        var guidanceOutput = this.getGuidanceOutputs(guidanceHistoryGr);
        var guidanceMessage = this.getGuidanceMessage(guidanceHistoryGr);
        var errorMessage = this.getGuidanceErrorMessage(guidanceHistoryGr.recommender, guidanceHistoryGr.recommended_by);
        var guidance = {
            value: guidanceHistoryGr.guidance_provided.sys_id + '',
            uniqueId: guidanceHistoryGr.getUniqueValue(),
            displayValue: guidanceHistoryGr.getDisplayValue('guidance_provided.title') + '',
            state: guidanceHistoryGr.state + '',
            renderTag: this.getRenderTag(guidanceHistoryGr, guidanceComponentGr),
            experienceMacroponent: this.getExperienceMacroponent(guidanceHistoryGr, guidanceComponentGr),
            guidanceMessage: guidanceMessage ? guidanceMessage : '',
            guidanceProperties: guidanceProps,
            guidanceActions: guidanceActions,
            actionData: actionTakenData,
            guidanceOutputs: guidanceOutput,
            createDate: guidanceHistoryGr.sys_created_on + '',
            version: guidanceHistoryGr.guidance_provided.version + '',
            recommender: guidanceHistoryGr.recommender + '',
            recommendedBy: guidanceHistoryGr.recommended_by + '',
            errorMessage: errorMessage + '',
            useCase: guidanceHistoryGr.recommended_by.use_case + '',
            showDismissButton: this.getDismissButtonConfig(guidanceHistoryGr),
            allowGoBack: guidanceHistoryGr.guidance_provided.allow_redo,
            hideCompletedGuidance: guidanceHistoryGr.guidance_provided.hide_completed_guidance
        };
        this.applyFixForOldInprogressGuidance(guidanceHistoryGr, guidance);
        return guidance;
    },
    /*
     * Get the dismiss button config details.
     */
    getDismissButtonConfig: function(guidanceHistoryGr) {
        var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtil();
        var recommenderhandler = guidanceUtil.getRecommenderHandler(guidanceHistoryGr.recommender);
        // recommended_by is an execution id
        return recommenderhandler.getDismissButtonConfig(guidanceHistoryGr.recommended_by);
    },

    /**
     * Fetch the respective guidance handler and checks if the current user has access to the guidance execution 
     * record for the given recommender, recommendedBy combination.
     */
    isUserValid: function(recommender, recommendedBy) {
        var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtil();
        var recommenderhandler = guidanceUtil.getRecommenderHandler(recommender);
        return recommenderhandler.isUserValid(recommendedBy);
    },

    getRenderTag: function(guidanceHistoryGr, guidanceComponentGr) {
        // if there is an experience macroponent available then renderTag is not needed.
        if (guidanceComponentGr.getValue('experience_macroponent'))
            return null;
        if (guidanceComponentGr.getValue('component'))
            return guidanceComponentGr.component.tag + '';
        if (guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION)
            return this.DEFAULT_NOCODE_GUIDANCE_COMPONENT;

        return this.DEFAULT_GUIDANCE_COMPONENT;
    },

    applyFixForOldInprogressGuidance: function(guidanceHistoryGr, guidance) {
        if (guidanceHistoryGr.related_record) //Need to change this condition based on version field in future
        {
            var guidanceComponentGr = new GlideRecord(this.GUIDANCE_COMPONENT_TABLE);
            guidanceComponentGr.get('guidance', guidanceHistoryGr.guidance_provided);
            guidance.version = this.OLD_VERSION;
            if (guidance.value == "636ecca277530010d7159b71a9106192") //Handle propose resolution custom experience in preview guidance framework.
                guidance.renderTag = "sn-guidance-resolution-card";
            else if (gs.nil(guidanceComponentGr.component))
                guidance.renderTag = this.DEFAULT_GUIDANCE_COMPONENT;
        }
    },
    getExecutedGuidanceAction: function(guidanceInstanceExecution) {
        var guidanceInstanceExecutionGr = new GlideRecord('ga_guidance_instance_execution');
        guidanceInstanceExecutionGr.get(guidanceInstanceExecution);
        return guidanceInstanceExecutionGr.getValue('action_taken');
    },
    getGuidanceActions: function(guidanceHistoryGr) {
        var executedAction = this.getExecutedGuidanceAction(guidanceHistoryGr.getValue('guidance_instance_execution'));
        var guidanceActionGr = new GlideRecord('ga_guidance_action');
        guidanceActionGr.addQuery('guidance', guidanceHistoryGr.guidance_provided);
        guidanceActionGr.query();
        var guidanceActions = {};
        while (guidanceActionGr.next()) {
            var guidanceActionName = guidanceActionGr.getValue('action_name') + '';
            guidanceActions[guidanceActionName] = this.getGuidanceActionObj(guidanceActionGr, executedAction);
        }
        return guidanceActions;
    },

    getGuidanceActionObj: function(guidanceActionGr, executedAction) {
        var guidanceAction = {
            action_label: guidanceActionGr.getDisplayValue('action_label') + '',
            action_name: guidanceActionGr.getValue('action_name') + '',
            display_position: guidanceActionGr.getValue('display_position') + '',
            action_sys_id: guidanceActionGr.getUniqueValue() + '',
            is_executed: executedAction == guidanceActionGr.getUniqueValue(),
            completion_message: guidanceActionGr.getDisplayValue('completion_message') + '',
            primary: guidanceActionGr.getDisplayValue('primary') === "true",
            action_behaviour: guidanceActionGr.getDisplayValue('action_behaviour'),
        };
        return guidanceAction;
    },

    getCallToActions: function(guidanceRecord) {
        var guidanceActionGr = new GlideRecord('ga_guidance_action');
        guidanceActionGr.addQuery('guidance', guidanceRecord.getUniqueValue());
        guidanceActionGr.orderBy('order');
        guidanceActionGr.orderBy('sys_created_on');

        var guidanceActions = [];
        var primaryPresent = false;
        guidanceActionGr.query();
        while (guidanceActionGr.next()) {
            guidanceActions.push(this.getCallToActionsObj(guidanceActionGr));
            if (!primaryPresent)
                primaryPresent = (guidanceActionGr.primary == true);
        }

        if (guidanceActions.length && !primaryPresent) {
            guidanceActions[0].primary = "true";
        }
        return guidanceActions;
    },

    getCallToActionsObj: function(guidanceActionGr) {
        var action_behavior = !guidanceActionGr.getValue('action_behaviour') ? this.CONTEXTUAL_SIDE_PANEL :
            guidanceActionGr.getValue('action_behaviour');
        var order = !guidanceActionGr.getValue('order') ? 100 :
            guidanceActionGr.getValue('order');
        var callToAction = {
            label: gs.nil(guidanceActionGr.getDisplayValue('preview_label')) ? guidanceActionGr.getDisplayValue('action_label') + '' : guidanceActionGr.getDisplayValue('preview_label') + '',
            name: guidanceActionGr.getValue('action_name') + '',
            id: guidanceActionGr.getUniqueValue() + '',
            actionBehavior: action_behavior + '',
            primary: guidanceActionGr.getValue('primary') == 1 ? 'true' : 'false',
            order: order + '',
            completionMessage: guidanceActionGr.getDisplayValue('completion_message') + ''
        };
        return callToAction;
    },

    getGuidanceObject: function(recommendedBy, recommender) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery("recommender", recommender);
        if (recommender == 'ga_decision_tree_execution') {
            guidanceHistoryGr.addQuery("state", "IN", "waiting,in_progress,in_error,error_skipped");
            guidanceHistoryGr.addQuery("recommended_by", "IN", this.getAllExecutions(recommendedBy, recommender) + '');
        } else
            guidanceHistoryGr.addQuery('recommended_by', recommendedBy);

        guidanceHistoryGr.orderByDesc('sys_created_on');
        guidanceHistoryGr.setLimit(1);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            return this.createGuidanceFromHistory(guidanceHistoryGr);
        }
        return {};
    },

    getGuidanceObjectBySysId: function(historyId) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        if (guidanceHistoryGr.get(historyId)) {
            return this.createGuidanceFromHistory(guidanceHistoryGr);
        }
        return {};
    },

    getGuidanceOutputs: function(guidanceHistoryGr) {
        var outputs = guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION ? guidanceHistoryGr.guidance_instance_execution.guidance_outputs : guidanceHistoryGr.guidance_outputs;
        var ret = {};
        for (var variable in outputs) {
            if (variable != "sys_meta" && variable != "sys_id") {
                var tempOutputValue = gs.nil(outputs[variable]) ? '' : outputs[variable].getRefRecord();
                if (this.isValidRecord(tempOutputValue) && !tempOutputValue.canRead()) {
                    ret[variable] = '';
                } else
                    ret[variable] = outputs[variable];
            }
        }
        ret.meta = this.getGuidanceOutputVarsForHistory(guidanceHistoryGr, outputs);
        return ret;
    },
    getGuidanceOutputVarsForHistory: function(guidanceHistoryGr, guidanceOutputObj) {
        var grGuidanceOutputsGr = new GlideRecord('ga_guidance_output');
        grGuidanceOutputsGr.addQuery('model_id', guidanceHistoryGr.guidance_provided);
        grGuidanceOutputsGr.orderBy('order');
        grGuidanceOutputsGr.query();
        var guidanceOutputMetaArr = [];
        while (grGuidanceOutputsGr.next()) {
            var tableName = grGuidanceOutputsGr.reference + '';
            var variableName = grGuidanceOutputsGr.element + '';
            var guidanceOutputLabel = this.getTranslatedFieldValue(grGuidanceOutputsGr, this.VAR__M_GA_GUIDANCE_OUTPUT_);

            var defValue = grGuidanceOutputsGr.default_value;
            var tempDefaultValue = gs.nil(defValue) ? '' : defValue.getRefRecord();
            if (this.isValidRecord(tempDefaultValue) && !tempDefaultValue.canRead())
                defValue = '';

            var guidanceOutputMeta = {
                varName: variableName,
                varType: grGuidanceOutputsGr.internal_type + '',
                varTableName: tableName,
                varlabel: guidanceOutputLabel + '',
                varDefaultValue: defValue + '',
                varOrder: grGuidanceOutputsGr.order + '',
                varActive: grGuidanceOutputsGr.active + '',
                varDisplayValue: this.getDisplayNameForReference(tableName, guidanceOutputObj[variableName] + '')
            };
            guidanceOutputMetaArr.push(guidanceOutputMeta);
        }
        return guidanceOutputMetaArr;
    },
    getDisplayNameForReference: function(tableName, sysId) {
        if (gs.nil(tableName) || gs.nil(sysId))
            return '';
        var gr = new GlideRecord(tableName);
        var displayNameColumnName = gr.getDisplayName();
        gr.get(sysId);
        if (!gr.canRead())
            return '';
        var displayNameValue = gr[displayNameColumnName] + '';
        return displayNameValue;
    },
    getAllExecutions: function(executionId, decisionTreeExecutionTable) {
        var executions = [];
        var decisionTreeGr = new GlideRecord(decisionTreeExecutionTable);
        decisionTreeGr.get(executionId);
        var parent;
        if (gs.nil(decisionTreeGr.parent)) {
            parent = executionId;
            executions.push(executionId);
        } else {
            parent = decisionTreeGr.parent;
            executions.push(parent);
        }
        var executionsGr = new GlideRecord(decisionTreeExecutionTable);
        executionsGr.addQuery("parent", parent);
        executionsGr.query();
        while (executionsGr.next()) {
            executions.push(executionsGr.sys_id + '');
        }
        return executions.join(',');
    },

    getAllGuidanceObjects: function(recommendedBy, recommender) {
        //recommendedBy for this function takes a string of comma seperated sysIds of recommending table
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery("recommended_by", "IN", recommendedBy);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.addQuery('state', 'IN', 'completed, skipped');
        guidanceHistoryGr.orderBy('sys_created_on');
        guidanceHistoryGr.query();
        var guidances = {};

        while (guidanceHistoryGr.next()) {
            var currentRecommendedBy = guidanceHistoryGr.recommended_by + '';
            var guidanceHistoryRecords = guidances[currentRecommendedBy] ? guidances[currentRecommendedBy] : [];
            guidanceHistoryRecords.push({
                recommender: recommender,
                guidanceObj: this.createGuidanceFromTreeHistory(guidanceHistoryGr)
            });

            guidances[currentRecommendedBy] = guidanceHistoryRecords;

        }
        return guidances;
    },

    createGuidanceFromTreeHistory: function(guidanceHistoryGr) {
        var guidanceComponentGr = new GlideRecord(this.GUIDANCE_COMPONENT_TABLE);
        guidanceComponentGr.get('guidance', guidanceHistoryGr.guidance_provided);
        var guidance = {
            value: guidanceHistoryGr.guidance_provided.sys_id + '',
            uniqueId: guidanceHistoryGr.getUniqueValue(),
            displayValue: guidanceHistoryGr.getDisplayValue('guidance_provided.title') + '',
            state: guidanceHistoryGr.state + '',
            renderTag: this.getRenderTag(guidanceHistoryGr, guidanceComponentGr),
            createDate: guidanceHistoryGr.sys_created_on + '',
            version: guidanceHistoryGr.guidance_provided.version + '',
            recommender: guidanceHistoryGr.recommender + '',
            recommendedBy: guidanceHistoryGr.recommended_by + '',
            allowGoBack: guidanceHistoryGr.guidance_provided.allow_redo,
            hideCompletedGuidance: guidanceHistoryGr.guidance_provided.hide_completed_guidance
        };
        this.applyFixForOldInprogressGuidance(guidanceHistoryGr, guidance);
        return guidance;
    },

    getGuidanceProps: function(guidanceHistoryGr, guidanceComponentGr) {
        var guidanceProps = {};
        var guidanceInputGr = new GlideRecord(this.GUIDANCE_INPUT_TABLE);
        guidanceInputGr.addQuery('model', guidanceHistoryGr.guidance_provided);
        guidanceInputGr.orderBy('order');
        guidanceInputGr.query();
        guidanceProps['associated_table'] = this.getCurrentPropObj('associated_table', guidanceHistoryGr.guidance_provided.related_table);

        guidanceProps['associated_record'] = this.getCurrentPropObj('associated_record', guidanceHistoryGr.related_record);
        guidanceProps['form_fields'] = this.getCurrentPropObj('form_fields', guidanceHistoryGr.guidance_provided.fields);

        var guidanceInputFormFields = {};
        while (guidanceInputGr.next()) {
            var guidanceInputName = guidanceInputGr.element;
            this.updateParentRecord(guidanceHistoryGr, guidanceInputName, guidanceProps);

            if (!gs.nil(guidanceInputGr.is_form_field) && guidanceInputGr.is_form_field && guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION && guidanceHistoryGr.guidance_instance_execution) {
                guidanceInputFormFields[guidanceInputName] = this.getGuidanceInputFormFieldsMetaData(guidanceInputGr, guidanceHistoryGr);
            } else {
                var guidanceInputValue = guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION && guidanceHistoryGr.guidance_instance_execution ? (guidanceHistoryGr.guidance_instance_execution.guidance_inputs[guidanceInputName] || '') : (guidanceHistoryGr.guidance_inputs[guidanceInputName] || '');

                var tempGuidanceInputValue = gs.nil(guidanceInputValue) ? '' : guidanceInputValue.getRefRecord();
                if (this.isValidRecord(tempGuidanceInputValue) && !tempGuidanceInputValue.canRead()) {
                    guidanceInputValue = '';
                }

                guidanceProps[guidanceInputName] = this.getCurrentPropObj(guidanceInputName, guidanceInputValue);

            }
        }

        guidanceProps['guidance_input_form_fields'] = guidanceInputFormFields;
        for (var propName in guidanceComponentGr.component_properties) {
            if (propName != "sys_meta" && propName != "sys_id") {
                guidanceProps[guidanceInputName] = this.getCurrentPropObj(propName,
                    guidanceComponentGr.component_properties[propName]);
            }
        }
        return guidanceProps;
    },

    updateParentRecord: function(guidanceHistoryGr, guidanceInputName, guidanceProps) {
        var isTask = (guidanceInputName == 'task' || guidanceInputName == 'Task' || guidanceInputName == 'u_task');
        if (isTask) {
            var inputValue = guidanceHistoryGr.guidance_inputs[guidanceInputName];
            guidanceProps['parent_table'] = this.getCurrentPropObj('parent_table', inputValue.sys_class_name);
            guidanceProps['parent_record'] = this.getCurrentPropObj('parent_record', inputValue);
        }
    },
    getTranslatedFieldValue: function(inputGr, prefix) {
        var sessionLanguage = gs.getSession().getLanguage();
        if (sessionLanguage != "en") {
            var documentationGr = new GlideRecord("sys_documentation");
            documentationGr.addQuery('name', prefix + inputGr.model);
            documentationGr.addQuery('element', inputGr.element + '');
            documentationGr.addQuery('language', sessionLanguage);
            documentationGr.query();
            if (documentationGr.next())
                return documentationGr.label + '';
        }
        return inputGr.label + '';
    },

    isValidRecord: function(record) {
        return record && typeof record.isValidRecord === 'function' && record.isValidRecord();
    },

    getGuidanceInputFormFieldsMetaData: function(inputGr, guidanceHistoryGr) {

        var value = guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION && guidanceHistoryGr.guidance_instance_execution ? (guidanceHistoryGr.guidance_instance_execution.guidance_inputs[inputGr.element] || '') : (guidanceHistoryGr.guidance_inputs[inputGr.element] || '');

        var displayValue;
        if (guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION && guidanceHistoryGr.guidance_instance_execution)
            displayValue = guidanceHistoryGr.guidance_instance_execution.guidance_inputs[inputGr.element].getDisplayValue();
        else
            displayValue = guidanceHistoryGr.guidance_inputs[inputGr.element].getDisplayValue() || '';
        var tempValue = gs.nil(value) ? '' : value.getRefRecord();
        var isAccessible = true;
        if (this.isValidRecord(tempValue) && !tempValue.canRead()) {
            value = '';
            displayValue = '';
            isAccessible = false;
        }

        var defvalues = {
            displayValue: displayValue + '',
            value: value + ''
        }
        var inputMetaData = this.getGuidanceFormFields(inputGr, this.INPUTS, defvalues);
        return inputMetaData;
    },
    setDeclarativeActions: function(inputMetaData) {
        inputMetaData['declarativeUiActions'] = [{
            name: 'reference_search',
            icon: 'search',
            label: 'Search for record',
            dependency: '',
            requiresValue: false,
            order: 0,
            actionComponent: 'sn-declarative-reference-search',
            actionAttributes: null,
            actionDispatch: null,
            actionPayload: null,
            actionType: 'action_component',
            tooltip: '',
            conditions: ''
        }];
    },
    addChoiceFields: function(inputGr, inputMetaData) {
        var choiceTable = inputGr.choice_table + '';
        var choiceField = inputGr.choice_field + '';
        var useExistingChoices = choiceTable != '' && choiceField != '';
        var name = (useExistingChoices) ? choiceTable : this.VAR__M_GA_GUIDANCE_INPUT_ + inputGr.model;
        var element = (useExistingChoices) ? choiceField : inputGr.element + '';
        var choiceGr = new GlideRecord('sys_choice');
        choiceGr.addQuery('name', name);
        choiceGr.addQuery('element', element);
        choiceGr.addQuery('inactive', false);
        choiceGr.addQuery('language', gs.getSession().getLanguage());
        choiceGr.orderBy('sequence');
        choiceGr.query();
        var choices = [];
        //Add 'None' choice when 'Dropdown with none' selected
        if (inputGr.getValue('choice') == 1) {
            var choice = {
                displayValue: gs.getMessage("-- None --"),
                value: " "
            };
            choices.push(choice);
        }
        while (choiceGr.next()) {
            var coice = {
                displayValue: choiceGr.label + '',
                value: choiceGr.value + ''
            };
            choices.push(coice);
        }

        inputMetaData['choices'] = choices;
    },

    addReferencFields: function(inputGr, inputMetaData) {
        inputMetaData['reference'] = inputGr.reference + '';
        inputMetaData['referenceQualifier'] = inputGr.reference_qual + '';
        inputMetaData['referenceKey'] = inputGr.reference_key + '';
        inputMetaData['useReferenceQualifier'] = inputGr.use_reference_qualifier + '';
        inputMetaData['dependent'] = inputGr.dependent + '';
        inputMetaData['dependentOnField'] = inputGr.dependent_on_field + '';
        inputMetaData['refAutoCompleter'] = null;
        inputMetaData['refAcOrderBy'] = null;
        inputMetaData['refAcColumns'] = null;
        inputMetaData['refAcColumnsSearch'] = false;
        inputMetaData['refAcDisplayValue'] = inputGr.display + '';
        inputMetaData['refQualElements'] = null;
        inputMetaData['refContributions'] = null;
        inputMetaData['isDynamicCreate'] = inputGr.dynamic_creation + '';
        inputMetaData['isReferenceScriptableTable'] = false;
        inputMetaData['inputTable'] = this.VAR__M_GA_GUIDANCE_INPUT_.concat(inputGr.model + '');
    },

    getCurrentPropObj: function(propName, propValue) {
        var prop = {
            name: propName + '',
            value: propValue + ''
        };
        return prop;
    },

    getActionTakenData: function(guidanceHistoryGr) {
        var resultData = {
            table: guidanceHistoryGr.result_object,
            id: guidanceHistoryGr.result_object_id
        };
        var actionTakenData = {
            resultData: resultData
        };
        return actionTakenData;
    },

    updateGHStateUsingRecommender: function(recommendedBy, recommender, state) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        if (recommender == 'ga_decision_tree_execution')
            guidanceHistoryGr.addQuery("recommended_by", "IN", this.getAllExecutions(recommendedBy, recommender) + '');
        else
            guidanceHistoryGr.addQuery('recommended_by', recommendedBy);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.orderByDesc('sys_created_on');
        guidanceHistoryGr.setLimit(1);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            guidanceHistoryGr.state = state;
            guidanceHistoryGr.update();
        }
    },

    updateGuidanceHistoryState: function(guidanceHistoryGr, state, errorMsg) {
        guidanceHistoryGr.setValue('state', state);
        if (errorMsg) {
            guidanceHistoryGr.setValue('error_message', errorMsg);
        }
        guidanceHistoryGr.update();
    },

    updateRelatedRecord: function(sysId, currentTask) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.get(sysId);
        guidanceHistoryGr.setValue('related_record', currentTask);
        guidanceHistoryGr.update();
    },

    updateResultObject: function(sysId, resultObject, resultObjectId) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.get(sysId);
        guidanceHistoryGr.setValue('result_object', resultObject);
        guidanceHistoryGr.setValue('result_object_id', resultObjectId);
        guidanceHistoryGr.update();
    },
    getGuidanceOutputByName: function(guidanceHistoryGr, output_name) {
        return guidanceHistoryGr.guidance_provided.version == this.NEW_VERSION ? guidanceHistoryGr.guidance_instance_execution.guidance_outputs[output_name] : guidanceHistoryGr.guidance_outputs[output_name];
    },
    getGuidanceInstanceExecutionSysId: function(recommender, recommendedBy) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery('recommended_by', recommendedBy);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.orderByDesc('sys_created_on');
        guidanceHistoryGr.setLimit(1);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            if (guidanceHistoryGr.state == "waiting") {
                guidanceHistoryGr.state = "in_progress";
                guidanceHistoryGr.update();
            }
            return guidanceHistoryGr.guidance_instance_execution;
        } else
            return "";
    },
    updateGuidanceInstanceExecution: function(recommender, recommendedBy, action_sys_id, inputData) {
        //Triggers Guidance Automation Flow Executor.
        var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtilSNC();
        var recommenderhandler = guidanceUtil.getRecommenderHandler(recommender);

        if (!recommenderhandler.isGuidanceActionAllowed(recommendedBy)) {
            return {
                actionStatus: this.constantUtil.ERROR,
                statusCode: this.constantUtil.ERROR_405,
                errorMessage: this.constantUtil.ERROR_405_MESSAGE
            };
        }
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery("recommended_by", recommendedBy);
        guidanceHistoryGr.addQuery("recommender", recommender);
        if (recommender == 'ga_decision_tree_execution')
            guidanceHistoryGr.addQuery("state", "IN", "waiting,in_progress");
        guidanceHistoryGr.orderByDesc('sys_created_on');
        guidanceHistoryGr.setLimit(1);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {

            if (guidanceHistoryGr.state == "waiting") {
                guidanceHistoryGr.state = "in_progress";
                guidanceHistoryGr.update();
            }
        }

        var sysId = this.getGuidanceInstanceExecutionSysId(recommender, recommendedBy);
        var glideRecord = new GlideRecord(this.GUIDANCE_INSTANCE_EXECUTION_TABLE);
        glideRecord.get(sysId);
        if (glideRecord.isValidRecord()) {
            if (inputData) {
				var self = this;
                Object.keys(inputData).forEach(function(f) {
                    var type = !gs.nil(inputData[f]) ? glideRecord.guidance_inputs[f].getED().getInternalType() : '';
                    if (self.DATE_TIME_TYPES.indexOf(type) !== -1) {
                        var gdt = new GlideDateTime();
                        gdt.setDisplayValue(inputData[f]);
                        glideRecord.guidance_inputs[f] = gdt.getValue();
                    } else {
                        glideRecord.guidance_inputs[f] = inputData[f];
                    }
                });
            }
            glideRecord.action_taken = action_sys_id;
            glideRecord.update();
            var ghr = this.getGuidanceHistoryRecord(recommender, recommendedBy);
            if (ghr.state == 'in_error') {
                return {
                    guidanceDetails: {
                        state: 'in_error',
                        errorMessage: ghr.error_message
                    }
                }
            }
            return this.ResultEnum.Success;
        } else {
            return this.ResultEnum.InvalidArguments;
        }

    },

    getGuidanceHistoryRecord: function(recommender, recommendedBy) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery(this.COL_RECOMMENDED_BY, recommendedBy);
        guidanceHistoryGr.addQuery(this.COL_RECOMMENDER, recommender);
        guidanceHistoryGr.orderByDesc('sys_created_on');
        guidanceHistoryGr.setLimit(1);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            return guidanceHistoryGr;
        }
        return '';
    },

    executeGuidanceActionSubAutomationPlan: function(guidanceInstanceExecutionGr) {
        var guidanceInputs = new Object();
        for (var input in guidanceInstanceExecutionGr.guidance_inputs) {
            if (input != "sys_meta" && input != "sys_id") {
                var inputValue = guidanceInstanceExecutionGr.guidance_inputs[input];
                if (gs.nil(inputValue) || gs.nil(inputValue.sys_id))
                    guidanceInputs[input] = inputValue + '';
                else {
                    guidanceInputs[input] = gs.nil(inputValue) ? '' : inputValue.getRefRecord();
                }
            }
        }
        var flowInputsGlideVar = guidanceInstanceExecutionGr.action_taken.flow_input_value;
        var parsedFlowInputs = new sn_gd_guidance.GuidanceVariablesPillParser().parseGuidanceActionFlowInputsPill(flowInputsGlideVar, guidanceInputs);
        var flowName = guidanceInstanceExecutionGr.action_taken.sub_automation_plan.sys_scope.scope + "." + guidanceInstanceExecutionGr.action_taken.sub_automation_plan.internal_name;
        var result;
        var guidanceOutputs;
        if (gs.getProperty(this.GUIDANCE_HONOR_SUBFLOW) == 'true') {
            result = sn_fd.FlowAPI.getRunner().subflow(flowName).inForeground().withInputs(parsedFlowInputs).run();
        } else {
            result = sn_fd.FlowAPI.getRunner().subflow(flowName).inForeground().withInputs(parsedFlowInputs).quick().asUser().run();
        }
        guidanceOutputs = result.getOutputs();

        return guidanceOutputs;
        //this.updateGuidanceInstanceExecGuidanceOutputs(guidanceOutputs,guidanceInstanceExecutionGr);
    },

    updateGuidanceInstanceExecGuidanceOutputs: function(guidanceOutputs, guidanceInstanceExecutionGr) {

        var guidanceOutputsGlideVar = guidanceInstanceExecutionGr.action_taken.guidance_output_value;
        var parsedGuidanceOutputs = new sn_gd_guidance.GuidanceVariablesPillParser().parseGuidanceActionVarsPill(guidanceOutputsGlideVar, guidanceOutputs);
        for (var output in guidanceInstanceExecutionGr.guidance_outputs) {
            if (output != "sys_meta" && output != "sys_id")
                guidanceInstanceExecutionGr.guidance_outputs[output] = parsedGuidanceOutputs[output];
        }
        guidanceInstanceExecutionGr.update();
    },

    updateGuidanceHistoryOutputsFromGuidanceInstanceExec: function(guidanceHistoryGr) {
        for (var output in guidanceHistoryGr.guidance_instance_execution.guidance_outputs) {
            if (output != "sys_meta" && output != "sys_id")
                guidanceHistoryGr.guidance_outputs[output] = guidanceHistoryGr.guidance_instance_execution.guidance_outputs[output];
        }
        guidanceHistoryGr.update();
    },

    getGuidanceOutputsForCardView: function(guidanceHistoryGr) {
        var grGuidanceOutputsGr = new GlideRecord('ga_guidance_output');
        grGuidanceOutputsGr.addQuery('model_id', guidanceHistoryGr.guidance_provided);
        grGuidanceOutputsGr.query();
        var guidanceOutputOrders = {};
        while (grGuidanceOutputsGr.next()) {
            var variableName = grGuidanceOutputsGr.element + '';
            guidanceOutputOrders[variableName] = grGuidanceOutputsGr.order + '';
        }
        var guidanceOutputArr = [];
        for (var key in guidanceHistoryGr.guidance_outputs) {
            if (key == 'sys_meta' || key == 'sys_id')
                continue;
            var guidanceOutput = {};
            guidanceOutput['label'] = guidanceHistoryGr.guidance_outputs[key].getLabel();
            var value = guidanceHistoryGr.guidance_outputs[key].getRefRecord();
            if (gs.nil(value)) {
                var fieldType = guidanceHistoryGr.guidance_outputs[key].getED().getInternalType();
                guidanceOutput['value'] = {
                    'type': fieldType != 'html' ? 'string' : fieldType,
                    'value': guidanceHistoryGr.guidance_outputs[key].getDisplayValue()
                };
            } else {
                var refProps = {
                    table: guidanceHistoryGr.guidance_outputs[key].getReferenceTable(),
                    sys_id: guidanceHistoryGr.guidance_outputs[key] + ''
                };
                guidanceOutput['value'] = {
                    "type": "text-link",
                    "label": guidanceHistoryGr.guidance_outputs[key].getDisplayValue(),
                    "href": "javascript:void(0)",
                    "underlined": "true",
                    "opensWindow": "false",
                    "append-to-payload": refProps
                };
            }
            guidanceOutput['order'] = guidanceOutputOrders[key];
            guidanceOutputArr.push(guidanceOutput);
        }
        guidanceOutputArr.sort(function(a, b) {
            return a.order - b.order;
        });
        return guidanceOutputArr;
    },

    getGuidanceActionDetails: function(guidanceHistoryGr) {
        var guidanceInstanceExecutionGr = new GlideRecord(this.GUIDANCE_INSTANCE_EXECUTION_TABLE);
        guidanceInstanceExecutionGr.get(guidanceHistoryGr.getValue(this.COL_GUIDANCE_INSTANCE_EXECUTION));
        var guidanceActionGr = new GlideRecord(this.GUIDANCE_ACTION_TABLE);
        guidanceActionGr.get(guidanceInstanceExecutionGr.getValue(this.COL_ACTION_TAKEN));
        var completionMessage = guidanceActionGr.getDisplayValue(this.COL_COMPLETION_MESSAGE);
        var actionBehaviour = guidanceActionGr.getValue(this.COL_ACTION_BEHAVIOUR);
        var actionDetails = {
            completionMessage: completionMessage,
            actionBehaviour: actionBehaviour
        };
        return actionDetails;
    },

    getGuidanceDetails: function(recommender, recommendedBy) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery('recommended_by', recommendedBy);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.query();
        var actionDetails = {};
        if (guidanceHistoryGr.next()) {
            var guidanceOutputs = this.getGuidanceOutputsForCardView(guidanceHistoryGr);
            actionDetails['actionOutputs'] = guidanceOutputs;
        }
        return actionDetails;
    },

    getGuidanceErrorMessage: function(recommender, recommendedBy) {
        var guidanceHistoryGr = new GlideRecord(this.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery('recommended_by', recommendedBy);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            return guidanceHistoryGr.error_message;
        }
        return "";
    },
    getExperienceMacroponent: function(guidanceHistoryGr, guidanceComponentGr) {
        if (!gs.nil(guidanceComponentGr.experience_macroponent))
            return guidanceComponentGr.experience_macroponent + '';

        return null;
    },
    getPreviewExperience: function(guidanceRecord) {
        var guidanceComponentGr = new GlideRecord(this.GUIDANCE_COMPONENT_TABLE);
        guidanceComponentGr.addQuery('guidance', guidanceRecord.getUniqueValue());
        guidanceComponentGr.setLimit(1);
        guidanceComponentGr.query();
        if (guidanceComponentGr.next()) {
            return guidanceComponentGr.getValue('preview_macroponent');
        }

        return '';
    },
    getGuidanceComponentById: function(guidanceComponentId) {
        var guidanceGr = new GlideRecordSecure('ga_guidance_component');
        guidanceGr.addQuery('guidance', guidanceComponentId);
        guidanceGr.setLimit(1);
        guidanceGr.query();

        if (guidanceGr.next()) {
            return guidanceGr;
        }

        return false;
    },

    createGuidanceComponent: function(guidanceId) {
        var guidanceGr = this.getGuidanceComponentById(guidanceId)
        if (!guidanceGr) {
            guidanceGr = new GlideRecordSecure('ga_guidance_component');
            guidanceGr.initialize();
        }
        return guidanceGr;
    },

    guidanceHasComponent: function(guidance) {
        var gr = new GlideRecord('ga_guidance_component');
        gr.addQuery('guidance', guidance.getUniqueValue());
        gr.addNotNullQuery('preview_macroponent');
        gr.setLimit(1);
        gr.query();
        return gr.next();
    },
    guidanceHasExperienceComponent: function(guidance) {
        var gr = new GlideRecord('ga_guidance_component');
        gr.addQuery('guidance', guidance.getUniqueValue());
        gr.addNotNullQuery('experience_macroponent');
        gr.setLimit(1);
        gr.query();
        return gr.next();
    },

    createDetailExperience: function(guidance, macroponent, screen) {
        var newExperience = this.createGuidanceComponent(guidance.getUniqueValue());
        newExperience.setValue('experience_screen', screen);
        newExperience.setValue('experience_macroponent', macroponent);
        newExperience.setValue('guidance', guidance.getUniqueValue());
        var guidanceComponent = newExperience.update();
    },

    createPreviewExperience: function(guidance, macroponent, screen) {
        var newPreviewExperience = this.createGuidanceComponent(guidance.getUniqueValue());
        newPreviewExperience.setValue('preview_screen', screen);
        newPreviewExperience.setValue('preview_macroponent', macroponent);
        newPreviewExperience.setValue('guidance', guidance.getUniqueValue());
        var guidanceComponent = newPreviewExperience.update();
    },

    ignoreGuidanceHistory: function(recommender, recommendedBy, guidanceId, state, createDate) {
        var guidanceHistoryGr = new GlideRecord(this.constantUtil.GUIDANCE_HISTORY_TABLE);
        guidanceHistoryGr.addQuery('recommender', recommender);
        guidanceHistoryGr.addQuery('recommended_by', recommendedBy);
        if (guidanceId) guidanceHistoryGr.addQuery('guidance_provided', guidanceId);
        guidanceHistoryGr.addQuery('state', 'IN', state);
        guidanceHistoryGr.orderByDesc('sys_created_on');
        guidanceHistoryGr.query();
        if (guidanceHistoryGr.next()) {
            var guidanceCreateDate = new GlideDateTime(guidanceHistoryGr.sys_created_on + '');
            if (createDate && guidanceCreateDate.compareTo(createDate) == -1)
                return false;
            guidanceHistoryGr.state = 'ignored';
            guidanceHistoryGr.update();
        }
        return true;
    },

    getGuidanceAutomationPlan: function(guidanceId) {
        var guidanceGr = new GlideRecord(this.GUIDANCE_TABLE);
        guidanceGr.get(guidanceId);
        return guidanceGr.getValue('automation_plan');
    },

    updateGuidanceHistoryRecord: function(recommendedBy, recommender, guidanceInputs) {
        var guidanceHistoryGr = this.getGuidanceHistoryRecord(recommender, recommendedBy);
        if (guidanceHistoryGr.isValidRecord()) {
            if (guidanceInputs) {
            	var self = this;
                Object.keys(guidanceInputs).forEach(function(f) {
                    var type = !gs.nil(guidanceInputs[f]) ? guidanceHistoryGr.guidance_inputs[f].getED().getInternalType() : '';
                    if (self.DATE_TIME_TYPES.indexOf(type) !== -1) {
                        var gdt = new GlideDateTime();
                        gdt.setDisplayValue(guidanceInputs[f]);
                        guidanceHistoryGr.guidance_inputs[f] = gdt.getValue();
                    } else {
                        guidanceHistoryGr.guidance_inputs[f] = guidanceInputs[f];
                    }
                });
                guidanceHistoryGr.update();
            }
        }

        var guidanceInstanceExecutionSysId = guidanceHistoryGr.guidance_instance_execution;
        //update guidance instance execution
        var guidanceInstanceGr = new GlideRecord(this.GUIDANCE_INSTANCE_EXECUTION_TABLE);
        guidanceInstanceGr.get(guidanceInstanceExecutionSysId);
        if (guidanceInstanceGr.isValidRecord()) {
            if (guidanceInputs) {
				var self = this;
                Object.keys(guidanceInputs).forEach(function(f) {
                    var type = !gs.nil(guidanceInputs[f]) ? guidanceInstanceGr.guidance_inputs[f].getED().getInternalType() : '';
                    if (self.DATE_TIME_TYPES.indexOf(type) !== -1) {
                        var gdt = new GlideDateTime();
                        gdt.setDisplayValue(guidanceInputs[f]);
                        guidanceInstanceGr.guidance_inputs[f] = gdt.getValue();
                    } else {
                        guidanceInstanceGr.guidance_inputs[f] = guidanceInputs[f];
                    }

                });
                guidanceInstanceGr.update();
            }
        }
    },


    type: 'GuidedDecisionsGuidanceModelSNC'
};
