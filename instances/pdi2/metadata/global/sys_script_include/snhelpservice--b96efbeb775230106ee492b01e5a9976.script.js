var SNHelpService = Class.create();
SNHelpService.prototype = {
    initialize: function() {

        this.helpAnswer = new SNHelpAnswerController();
        this.helpConstant = new SNHelpConstantProvider();
        this.helpContent = new SNHelpContentController();
        this.helpDb = SNHelpDBController;
        this.helpGuidance = new SNHelpGuidanceController();
        this.helpGuidanceInteraction = new SNHelpGuidanceInteractionController();
        this.helpGuidanceRest = new SNHelpGuidanceRestHandler();
        this.helpGuidanceStep = new SNHelpGuidanceStepController();
        this.helpGuidanceStepInteraction = new SNHelpGuidanceStepInteractionController();
        this.helpQuestion = new SNHelpQuestionController();
        this.helpResource = new SNHelpResourceController();
        this.helpUtil = new SNHelpUtil();
    },

    queryNoDomain: function(gr) {
        gr.queryNoDomain();
    },

    fetchDomain: function() {
        var ssg, domainID;
        try {
            ssg = new ScopedSessionDomain();
            domainID = ssg.getCurrentDomainID();
        } catch (er) {
            domainID = 'global';
        }
        if (!domainID) domainID = "global";
        return domainID;
    },

    setWorkflowFromDiffScope: function(gr, value) {
        gr.setWorkflow(value);
    },

    insertTriggerRecord: function(setupName, processId) {
        var processTriggerGR = new GlideRecord('sys_pd_trigger_instance');
        processTriggerGR.initialize();
        processTriggerGR.setValue('process_definition', processId);
        processTriggerGR.setValue('trigger_type', "789911170f1200108c87f4f0ff767e27");
        processTriggerGR.setValue('label', 'Trigger for ' + setupName);
        return processTriggerGR.insert();
    },

    type: 'SNHelpService'
};
