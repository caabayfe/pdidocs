var SNHelpSetupController = Class.create();
SNHelpSetupController.prototype = {

    initialize: function() {
        this.helpService = new global.SNHelpService();
        this.constants = new sn_ads_setup.SNHelpSetupConstantProvider();
        this.dbController = new global.SNHelpDBController(this.constants.tables.user_interaction);
        this.gc = this.helpService.helpGuidance;
        this.gsc = this.helpService.helpGuidanceStep;
        this.gic = this.helpService.helpGuidanceInteraction;
        this.gsic = this.helpService.helpGuidanceStepInteraction;
        this.setupUtil = new sn_ads_setup.SNHelpSetupUtil();
        this.setupService = new sn_ads_setup.SNHelpSetupService();
        this.setupDependencyService = new SNHelpSetupDependencyService();
    },

    getSetupDetails: function(sys_id, task_type) {
        var setup = this.setupService.getGuidance(sys_id, this.constants.restAPIKeys.setup, task_type);

        setup = setup && setup.guidance;

        return setup;
    },

    getSetupDetailsWithStatus: function(sys_id) {
        var setup = this.getSetupDetails(sys_id),
            setupItr;
        var isGlobal;
        if (!setup)
            return null;

        isGlobal = setup.type === this.constants.setupType.GLOBAL_SETUP;
        setupItr = this.gic.getByGuidanceId(sys_id, isGlobal);

        setup.activeSetupType = setupItr && setupItr.active_setup_type;
        setup.isComplete = setupItr && this.setupUtil.isAllMandatoryTasksCompleted(sys_id, setupItr.sys_id, this.constants.playTypeToStepType[setupItr.active_setup_type]);
        setup.interactionId = setupItr && setupItr.sys_id;
        setup.interactionStatus = setupItr && this.constants.statusToLabel[setupItr.status] || this.constants.statusToLabel[this.constants.status.NOTSTARTED];


        if (Array.isArray(setup.steps) && setup.steps.length > 0 && setupItr) {
            var self = this;
            setup.steps.forEach(function(step) {
                var interactionId = setupItr && setupItr.sys_id;
                var stepItr = self.getInteractionStatus(step, sys_id);
                step.interactionStatus = stepItr && self.constants.statusToLabel[stepItr.interaction_status] || self.constants.statusToLabel[self.constants.status.NOTSTARTED];
                step.interactionId = stepItr && stepItr.interaction_id;
                if (step.name.toString().indexOf(self.constants.pluginName) != -1)
                    step.hasChildren = self.setupUtil.pluginCategoryHasTasks(step.sys_id, self.constants.playTypeToStepType[setupItr.active_setup_type]);
                else
                    step.hasChildren = self.setupUtil.hasChildOfType(step.sys_id, self.constants.playTypeToStepType[setupItr.active_setup_type]);

                self.populateDependencyInfo(step, interactionId);
            });
            //Return only the categories with steps 
            setup.steps = setup.steps.filter(function(step) {
                return step.hasChildren != false;
            });
        }

        return setup;
    },

    getAllTasksForStep: function(step_id, task_type) {
        return this.setupService.getSetupSteps(step_id, task_type);
    },

    getAllTasksForStepWithStatus: function(step_id, interactionId, task_type) {
        var tasks = this.getAllTasksForStep(step_id, task_type);
        var interactionStep, interaction;

        if (!(Array.isArray(tasks) && tasks.length > 0))
            return null;

        if (this.setupService.isCategoryforPlugins(step_id)) {
            //Filter results based on task type 
            // Assumption: There will always plugin related tasks will be 
            //created (basic, advanced, recommnended)

            task_type = task_type || this.constants.taskType.ADVANCED;
            tasks = tasks.filter(function(task) {
                return task.task_type == task_type;
            });

            if (!(Array.isArray(tasks) && tasks.length > 0))
                return null;

        }
        if (!interactionId)
            interactionId = this.getInteractionId(tasks[0].guidance);

        interactionStep = this.getStepInteraction(step_id, tasks[0].guidance, interactionId);

        var self = this;
        tasks.forEach(function(task) {
            interactionId = interactionId || interactionStep && interactionStep.user_interaction;
            var stepItr = self.getInteractionStatus(task, '', interactionId);
            task.interactionStatus = stepItr && self.constants.statusToLabel[stepItr.interaction_status];
            task.interactionId = stepItr && stepItr.interaction_id;
            self.populateDependencyInfo(task, interactionId);
        });

        return {
            tasks: tasks

        };
    },

    /*
    Add dependency info to step 
    @param step, a guidance step
    @param interactinoId for guidance 
    @return updated step with dependency details if dependent
    */
    populateDependencyInfo: function(step, interactionId) {
        var isDependent = this.setupUtil.isStepDependent(step.sys_id);

        if (isDependent) {
            step.isDependent = true;
            step.dependencies = this.setupUtil.getDependencies(step.sys_id);
            if (this.setupUtil.isDependentOnPluginStep(step)) {
                step.isLocked = !this.setupUtil.isPluginTaskCompleted(step, interactionId);
            } else {
                step.isLocked = this.setupUtil.isStepLocked(step.sys_id, interactionId);
            }
        } else {
            step.isDependent = false;
            step.dependencies = null;
            step.isLocked = false;
        }
    },

    getInteractionStatus: function(step, guidanceId, stepItrId) {
        var stepItr, result = {};

        if (guidanceId)
            stepItr = this.getStepInteraction(step.sys_id, guidanceId);

        if (stepItrId)
            stepItr = this.gsic.getByGuidanceStepId(step.sys_id, stepItrId);

        if (stepItr) {
            result.interaction_status = stepItr.status;
            result.interaction_id = stepItr.sys_id;
        }
        return result;
    },

    getStepDetails: function(sys_id) {
        var stepDetails = this.setupService.getSetupStep(sys_id);

        if (stepDetails)
            stepDetails.isPluginCategory = this.setupUtil.hasPluginStep(stepDetails.guidance) == sys_id;

        return stepDetails;
    },

    getTaskDetailsWithStatus: function(sys_id, interactionId) {
        var step = this.getStepDetails(sys_id);
        if (!step)
            return null;

        if (!interactionId)
            interactionId = this.getInteractionId(step.guidance);

        step.interaction = this.getStepInteraction(sys_id, step.guidance, interactionId);
        step.interactionStatus = step.interaction && this.constants.statusToLabel[step.interaction.status];
        this.populateDependencyInfo(step, interactionId);

        if (step.dependencies && Array.isArray(step.dependencies)) {
            var gr = new GlideRecord("help_setup_dependency");
            for (var dependency = 0; dependency < step.dependencies.length; dependency++) {
                gr.get(step.dependencies[dependency].sys_id);
                step.dependencies[dependency].dependent_on_steps = gr.getDisplayValue("dependent_on_steps");
            }
        }
        return step;
    },

    getStepInteraction: function(stepId, guidanceId, interactionId) {
        var interaction;
        // if interactionId is not supplied find the interaction and then find the interactionStep 
        if (!interactionId) {
            interaction = this.gic.findInteraction(guidanceId, this.gc.isGlobal(guidanceId));
            if (!interaction)
                return null;
            interactionId = interaction && interaction.sys_id;
        }

        return this.gsic.getByGuidanceStepId(stepId, interactionId);
    },

    getInteractionId: function(guidanceId) {
        var interaction = this.gic.findInteraction(guidanceId, true);

        if (!interaction)
            return null;

        return interaction.sys_id;
    },

    // insert or update new setup step
    upsertSetupStep: function(setupId, stepId, params) {
        var setupService = new SNHelpSetupService();
        var result = {};

        if (params && params.guidance !== setupId)
            params.guidance = setupId;

        result = setupService.upsertStep(stepId, params);

        if (result.data)
            result.data = this.getStepDetails(result.data);

        return result;
    },

    /*
                Fetches interaction details of a guidance
                @param guidanceId 
                @return interaction detatils object
    */

    selectGuidance: function(sys_id) {

        var setup = {},
            surveyStep, setupType = {},
            activeSetupType, surveyStepId, questions, stepItr,
            setupItr = this.gic.getByGuidanceId(sys_id, true);

        activeSetupType = setupItr && setupItr.active_setup_type;
        setup.isComplete = (setupItr && setupItr.status == this.constants.status.COMPLETE) || (setupItr && setupItr.status == this.constants.status.AUTOCOMPLETE);

        setup.interactionId = setupItr && setupItr.sys_id;
        setup.interactionStatus = setupItr && this.constants.statusToLabel[setupItr.status] || this.constants.statusToLabel[this.constants.status.NOTSTARTED];

        surveyStep = this.setupService.getSurveyStep(sys_id);
        setup.hasSurvey = false;

        if (Array.isArray(surveyStep) && surveyStep.length > 0) {
            surveyStepId = surveyStep[0].sys_id;
            setup.hasSurvey = true;
            setup.survey = this.getTaskDetailsWithStatus(surveyStepId);
            setup.surveyId = surveyStepId;
            //Todo: Survey questions status 
        }

        if (setup.interactionId && activeSetupType) {
            setupType.type = this.constants.playTypeToStepType[activeSetupType];

            stepItr = this.setupService.getInteractionStepStatusByType(setup.interactionId, setupType.type, sys_id);


            //Override task type status if the setup is complete 
            if (setup.interactionStatus == this.constants.statusToLabel[this.constants.status.COMPLETE])
                setupType.status = this.constants.statusToLabel[this.constants.status.COMPLETE];
            else
                setupType.status = stepItr && stepItr.status;
            setupType.timeStamp = stepItr && stepItr.timeStamp;
            setupType.label = this.constants.playType[activeSetupType];
        }
        setup.setupType = setupType;

        return setup;

    },

    /*
                Fetches interaction details of a guidance
                @param guidanceId 
                @return summary of the guidance 
    */

    getGuidanceSummary: function(guidanceId) {
        var self, stepTasks, result = {},
            setup, setupSteps,
            stepsPayload = [],
            tasksPayload = [],
            stepPayload, taskPayload, isComplete = false,
            dependenciesObj = [];

        setup = this.getSetupDetails(guidanceId);

        if (setup) {
            setupSteps = setup.steps;
            result.setupID = setup.sys_id;
            result.setupName = setup.name;
            result.status = setup.status;
            result.sysScope = setup.sys_scope;
            result.description = setup.description;
        }

        if (Array.isArray(setupSteps) && setupSteps.length > 0) {
            self = this;
            isComplete = true; // Assumption is all the tasks are done

            const dbControllerContent = new global.SNHelpDBController(self.constants.tables.content);
            const content = dbControllerContent.getByEncodedQuery("guidance_step.guidance=" + guidanceId, "", this.constants.restAPIKeys.setupContent);
            let contentObj = {};
            if (content) {
                for (let ind = 0; ind < content.length; ind++) {
                    let relatedContent = null;
                    if (content[ind].related_content) {
                        relatedContent = this.setupService.getRelatedContent(content[ind].related_content);
                    }

                    contentObj[content[ind].guidance_step] = {
                        "task_type": content[ind].configuration_types,
                        "content": content[ind]
                    };
                    contentObj[content[ind].guidance_step].content.related_content = relatedContent;
                }
            }

            setupSteps.forEach(function(step) {
                stepPayload = {};

                //If any of the status is not zero, set is complete to true
                if (step.status != '0')
                    isComplete = false;

                stepPayload.status = self.constants.stepStatusToLabel[step.status];
                stepPayload.id = step.sys_id;
                stepPayload.order = step.order;
                stepPayload.name = step.name;
                stepPayload.type = self.constants.stepType.GROUP;
                stepPayload.isPluginCategory = self.setupService.isCategoryforPlugins(step.sys_id);
                stepPayload.dependencies = []; // we don't support this case; category can not have depedencies
                stepPayload.dependents = self.setupUtil.getDependentSteps(step.sys_id);
                stepPayload.dependenciesObj = [];
                stepPayload.description = step.rich_description || step.description;
                stepPayload.content = contentObj[step.sys_id] && contentObj[step.sys_id].content;
                stepTasks = self.getAllTasksForStep(step.sys_id);

                if (stepPayload.isPluginCategory) {
                    stepTasks = stepTasks.filter(function(task) {
                        return contentObj[task.sys_id]?.content?.records;
                    });
                }

                stepTasks.forEach(function(task) {
                    taskPayload = {};
                    taskPayload.id = task.sys_id;
                    taskPayload.order = task.order;
                    taskPayload.name = task.name;
                    taskPayload.type = self.constants.stepType.ACTIVITY;
                    taskPayload.configuration_types = contentObj[task.sys_id]?.task_type;
                    taskPayload.task_type = task.task_type;
                    taskPayload.lane_id = task.parent;
                    taskPayload.status = self.constants.stepStatusToLabel[task.status];
                    taskPayload.status_value = task.status;
                    taskPayload.parent = task.parent;
                    taskPayload.dependenciesObj = []; //value will be Populated in getMatchedtasksDependencies
                    taskPayload.dependencies = self.setupUtil.getDependencies(task.sys_id);
                    taskPayload.dependents = self.setupUtil.getDependentSteps(task.sys_id);
                    taskPayload.description = task.rich_description || task.description;
                    taskPayload.content = contentObj[task.sys_id] && contentObj[task.sys_id].content;
                    tasksPayload.push(taskPayload);
                });

                stepsPayload.push(stepPayload);
            });
        }
        result.steps = this.setupUtil.getMatchedDependencies(stepsPayload, tasksPayload);
        result.tasks = this.setupUtil.getMatchedDependencies(tasksPayload, stepsPayload);
        result.isComplete = isComplete;

        return result;
    },

    /*
                create m2mDependency 
                @param dependency_id  -1  
                @step_id step id on which dependency needs to be created 
                @return sys_id of m2mdependency 
    */

    createM2MDependency: function(dependencyId, stepId, params) {
        var m2m,
            dependency,
            m2mDependency,
            stepName;

        if (stepId == "-1" || dependencyId != "-1")
            return null;

        m2m = this.setupDependencyService.getM2MDependency(stepId);
        if (Array.isArray(m2m) && m2m.length > 0)
            return this.updateM2MDependency(stepId, m2m[0].sys_id, params);

        stepName = this.getStepDetails(stepId);
        stepName = stepName && stepName.name;
        dependency = this.setupDependencyService.createDependency(params, stepName);
        if (dependency) {
            m2m = this.setupDependencyService.createM2MDependency({
                guidance_step: stepId,
                setup_dependency: dependency
            });
            if (!m2m)
                return null;
        }
        m2mDependency = this.setupDependencyService.getM2MDependency(stepId, m2m);

        if (Array.isArray(m2mDependency) && m2mDependency.length > 0)
            return this.setupDependencyService.getFormattedDependency(m2mDependency[0]);


        return null;
    },

    /*
                update m2mDependency 
                @param dependency_id 
                @step_id step id
                @params params 
                @return sys_id of m2mdependency 
    */

    updateM2MDependency: function(stepId, dependencyId, params) {
        var m2mDependencies,
            dbController,
            dependencies;

        if (!stepId || !dependencyId)
            return null;

        dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
        m2mDependencies = dbController.getById(dependencyId, ['sys_id', 'guidance_step', 'setup_dependency']);

        if (!m2mDependencies)
            return null;

        dependencies = this.setupDependencyService.updateDependency(m2mDependencies.setup_dependency, params);

        m2mDependencies = this.setupDependencyService.updateM2MDependency(dependencyId, {
            guidance_step: stepId,
            setup_dependency: dependencies
        });

        if (!m2mDependencies)
            return null;

        m2mDependencies = this.setupDependencyService.getM2MDependency(stepId, dependencyId);

        if (Array.isArray(m2mDependencies) && m2mDependencies.length > 0)
            return this.setupDependencyService.getFormattedDependency(m2mDependencies[0]);


        return null;
    },



    getStepM2MDependency: function(dependencyId, stepId) {
        var dependencies,
            dbController,
            query = '',
            orderBy,
            dependencyFields,
            results = [],
            self;

        if (dependencyId == "-1")
            query += 'guidance_step.sys_id=' + stepId;
        else
            query += 'sys_id=' + dependencyId;

        orderBy = 'sys_updated_on';
        dependencyFields = ['sys_id', 'guidance_step', 'setup_dependency'];

        dbController = new global.SNHelpDBController(this.constants.tables.m2m_step_dependency);
        dependencies = dbController.getByEncodedQuery(query, orderBy, dependencyFields);

        if (!dependencies)
            return null;


        if (Array.isArray(dependencies) && dependencies.length > 0) {
            self = this;
            dependencies.forEach(function(dependency) {
                results.push(self.setupDependencyService.getFormattedDependency(dependency));
            });
        }

        return results;

    },

    /*
                delete m2mDependency 
                @param dependency_id 
                @param step_id
                @return boolean
    */

    deleteM2MDependency: function(dependencyId, stepId) {
        return this.setupDependencyService.deleteM2MDependency(dependencyId, stepId);
    },

    reorder: function(setupId, data) {
        var destinationCategory = data.destination_category;
        var step = data.step;
        var sourceCategory = data.source_category;
        var destinationOrder = data.destination_order;
        var type = data.type;
        var result = "";
        if (!GlideStringUtil.isEligibleSysID(setupId)) {
            return {
                status: 400,
                message: "Invalid setupId",
                data: data
            };
        }
        if (type != this.constants.stepType.GROUP && !(GlideStringUtil.isEligibleSysID(step) && GlideStringUtil.isEligibleSysID(sourceCategory) && GlideStringUtil.isEligibleSysID(destinationCategory) && destinationOrder > 0)) {
            return {
                status: 400,
                message: "Invalid order or sys_id of step(s)",
                data: data
            };
        } else {
            if (!(GlideStringUtil.isEligibleSysID(step) && destinationOrder > 0)) {
                return {
                    status: 400,
                    message: "Invalid order or sys_id of step",
                    data: data
                };
            }

        }
        result = this.setupService.reorderStep(setupId, data);
        return {
            status: result.status,
            message: result.message,
            data: data
        };
    },

    addInteractionLog: function(setupId, stepId, params) {

        if (params && params.guidance !== setupId)
            params.guidance = setupId;
        if (params && params.guidance_step !== stepId)
            params.guidance_step = stepId;

        return this.setupService.addInteractionLog(params);
    },

    // Its used to set the execution status to complete.
    setGuidanceAutoComplete: function(guidanceId, interactionId) {

        const SINGLE = 'single';

        var domain = this.helpService.fetchDomain();

        var gr = new GlideRecord(this.constants.views.in_progress_setup_view);
        gr.addQuery('hg_sys_id', guidanceId);
        if (interactionId) {
            gr.addQuery('hui_sys_id', interactionId);
        }
        gr.addQuery('hui_status', '!=', 'abandoned');
        this.helpService.queryNoDomain(gr);

        // Fetch all domain records for given guidanceId
        while (gr.next()) {
            var recordDomain = gr.getValue('hui_sys_domain');
            var hgrExecutionType = gr.getValue('hg_setup_execution_type') || SINGLE;
            var huiExecutionType = gr.getValue('hui_setup_execution_type') || SINGLE;

            if (hgrExecutionType != huiExecutionType) continue;

            // Find the matching domain HUI record and mark its status complete
            if (recordDomain === domain) {
                var hu_id = gr.getValue('hui_sys_id');
                var hu = new GlideRecord(this.constants.tables.user_interaction);
                hu.addQuery('guidance', guidanceId);
                hu.addQuery('sys_id', hu_id);
                this.helpService.queryNoDomain(hu);
                if (hu.next()) {
                    hu.status = this.constants.status.COMPLETE;
                    hu.update();
                }
                break;
            }
        }
        return null;
    },

    upsertInteraction: function(guidanceId, steupType) {
        return this.setupService.upsertInteraction(guidanceId, steupType);
    },

    configurePluginsForSetupType: function(setupId, pluginCategory, params) {
        var pluginStep = this.setupUtil.hasPluginStep(setupId);
        var result = {};

        if (pluginStep != pluginCategory) {
            result.status = 400;
            result.message = gs.getMessage("Invalid or duplicate plugin category sys_id {0}", pluginCategory);
            return result;
        }

        return this.setupService.configurePluginsForSetupType(setupId, pluginCategory, params);
    },

    upsertStepInputInInteractionStepTable: function(stepId, params) {
        var result = {};
        var gr = new GlideRecordSecure(this.constants.tables.user_interaction_step);
        gr.addQuery('sys_id', stepId);
        gr.query();
        if (gr.hasNext() && gr.next()) {
            gr.step_input = params.step_input;
            gr.update();
        } else {
            result.status = 400;
            result.message = gs.getMessage("Invalid step Id {0}", stepId);
            return result;
        }
        result.status = 200;
        result.data = {
            sys_id: stepId
        };
        return result;
    },

    /**
     * 
     * @param {InteractionId} id 
     * @param {SystemDomain} domain 
     * @returns 
     * State:
     * 0: Exact match of record with correct domain
     * 1: Current domain dont have access, please change domain.
     * 2: Incorrect sys id
     */
    checkHuiState: function(id, domain) {
        // Checks if given execution id presents[0] with current instance domain
        // If not , checks if domain is incorrect[1] or execution id itself is incorrect[2].
        var gr = new GlideRecord(this.constants.tables.user_interaction);
        gr.addQuery('sys_id', id);
        gr.addQuery('status', '!=', 'abandoned');
        this.helpService.queryNoDomain(gr);
        var rc = gr.getRowCount();

        while (gr.next()) {
            var recordDomain = gr.getValue('sys_domain');
            var recordId = gr.getValue('sys_id');
            if (recordId === id) {
                if (recordDomain === domain) {
                    return 0;
                } else {
                    return 1;
                }
            }
        }
        return 2;

    },


    /*
    API exposed to create dynamic executions based on provided setup_name, description for both single/multiple execution GS.
    1. Returned sysId as "" or null indicates could not create execution due to some error.
    2. Can create multiple execution too , 1 execution is 1 element. Array of such execution payload is provided to this method.
    3. Sample payload for reqParams: 
        [{
            description: 'Execution description',
            setup_name: 'Execution name',
            sys_id: -1
        }]
    */
    createInteractionForGuidedSetup: function(setupId, reqParams) {

        var result = {
            status: 200,
            data: []
        };

        if (!this.gc.isGlobal(setupId)) {
            result.message = gs.getMessage('Provide setupId is not a Guided Setup');
            result.status = 500;
            return result;
        }

        var domain = this.helpService.fetchDomain();

        var isMultiExecution = false,
            count_if_skip = 0; // Count existing records in case skippable GS execution case

        var hg = new GlideRecordSecure(this.constants.tables.guidance);

        if (hg.get(setupId)) {
            isMultiExecution = hg.getValue('setup_execution_type') == 'multiple';

        } else {
            gs.warn("Error while creating interaction record for setup " + setupId);
            result.status = 500;
            result.message = gs.getMessage("Error creating Interaction Record for setup {0}, Invalid setup Id!", setupId);
            return result;
        }


        if (!isMultiExecution && reqParams.length > 1) {
            gs.warn("Error while creating interaction record for setup " + setupId);
            result.status = 500;
            result.message = gs.getMessage("Error creating Interaction Record for setup {0}, Multiple interaction creation is not feasible for single run setup!", setupId);
            return result;
        }

        for (let i = 0; i < reqParams.length; i++) {

            // One iteration corresponds to create one execution for given sample payload at a time.
            let param = reqParams[i];
            let sysId = null;

            if (param && Object.keys(param).length) {

                var {
                    sys_id: givenSysId,
                    ...execParam
                } = param;

                var params = {
                    guidance: setupId,
                    active_setup_type: 'custom',
                    status: this.constants.status.IN_PROGRESS,
                    sys_domain: domain,
                    ...execParam
                };

                if (givenSysId && givenSysId != '-1') {
                    // sysId provided , query existing execution with current sessions matching domain. 
                    // 1. If sysId exists and domain dont match; throw error saying cant create
                    // 2. If sysId exists and domain matches; update existing one

                    var state = this.checkHuiState(givenSysId, domain);
                    if (state === 0) {
                        sysId = dbController.update(givenSysId, params);
                    } else {
                        // state 1 or 2 , error out basically BU will have to reachout admin to fix these cases. We can document it. 
                        sysId = '';
                    }

                } else {
                    // No sysId provided means create one.
                    var found = false;
                    var gr = new GlideRecord(this.constants.tables.user_interaction);
                    gr.addQuery('guidance', setupId);
                    this.helpService.queryNoDomain(gr);

                    // Before creating, just check this edge case
                    // 1. For single execution GS, if any corresponding single guided setup already exists, we cant create as its single execution.
                    // 2. For multiple we can create irrespective of if its present or not. So no need to check for that.
                    if (!isMultiExecution) {

                        while (gr.next()) {
                            if (gr.getValue('sys_domain') === domain) {
                                sysId = gr.getValue('sys_id');
                                found = true;
                                break;
                            }
                        }
                    } else {
                        count_if_skip = gr.getRowCount();
                    }


                    // Creation of single/multiple record will take place here.
                    if (!found) {
                        if (!givenSysId || givenSysId == "-1") {
                            // If setup_name passed empty, means its a case of skipExecutionPage.
                            params.setup_name = params.setup_name || (hg.getValue('product_name') + '_' + (count_if_skip + 1));
                            params.description = params.description || hg.getValue('description');
                        }

                        sysId = this.dbController.create(params);
                    }

                }

            }
            // sysId: '' indicates could not create HUI. sysId null indicates params empty.
            result.data.push({
                ...param,
                sys_id: sysId
            });
        }
        return result;

    },

    getPluginsBySetupType: function(setupId, pluginCategory) {
        var pluginStep = this.setupUtil.hasPluginStep(setupId);
        var result = {};

        if (pluginStep != pluginCategory) {
            result.status = 400;
            result.message = gs.getMessage("Invalid or duplicate plugin category sys_id {0}", pluginCategory);
            return result;
        }

        return this.setupService.getPluginsBySetupType(setupId, pluginCategory);
    },

    getPDLaneDescriptions: function(contextLaneSysIds) {
        var result = {};
        var pdlc = new GlideRecordSecure('sys_pd_lane_context');
        pdlc.addQuery(contextLaneSysIds);
        pdlc.orderBy('order');
        pdlc.query();
        var pdlcLanesSysIds = '';
        var pdlcToPdl = {};
        while (pdlc.next()) {
            if (pdlcLanesSysIds) {
                pdlcLanesSysIds += '^OR';
            }
            pdlcLanesSysIds += 'sys_id=' + pdlc.lane.toString();
            pdlcToPdl[pdlc.sys_id.toString()] = pdlc.lane.toString();
        }

        if (!pdlcLanesSysIds) {
            result.status = 400;
            result.error = {
                message: gs.getMessage("Invalid context lane sys Id {0}", contextLaneSysIds)
            };
            return result;
        }

        var pdl = new GlideRecordSecure('sys_pd_lane');
        pdl.addQuery(pdlcLanesSysIds);
        pdl.orderBy('order');
        pdl.query();
        var pdlToDesc = {};
        while (pdl.next()) {
            pdlToDesc[pdl.sys_id.toString()] = pdl.description.toString();
        }

        Object.keys(pdlcToPdl).forEach(function(ctx) {
            var ctxLane = pdlcToPdl[ctx];
            pdlcToPdl[ctx] = {
                pdLaneSysId: ctxLane,
                description: pdlToDesc[ctxLane]
            }
        });

        result.status = 200;
        result.data = {
            contextLaneDescriptions: pdlcToPdl
        };
        return result;

    },

    type: 'SNHelpSetupController'
};
