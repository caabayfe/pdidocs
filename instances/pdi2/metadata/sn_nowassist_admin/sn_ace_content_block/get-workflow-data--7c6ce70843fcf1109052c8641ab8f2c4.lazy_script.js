(function(context, pageParams, blockcontext) {
    // return some_output
    var workflowsData = NAAWorkFlowFeatureUtil.getWorkflowsDataWithNoActivePlugin();
    var getStartedWorkflowsData = workflowsData.getStartedWorkflowsData;
    var creatorWorkflowsData = workflowsData.creatorWorkflowsData;

    var getStartedWorkflowsLen = getStartedWorkflowsData.length;
    for (var i = 0; i < getStartedWorkflowsLen; i++) {
        if (i != getStartedWorkflowsLen - 1) {
            // Add divider css to getStartedWorkflow cards
             // some languages are rtl, hence border position is different for them
            var borderPosition = ['ar','he'].includes(gs.getSession().getLanguage()) ? 'left' : 'right';
            getStartedWorkflowsData[i].divider_css = "*{ border-"+borderPosition+": 1px solid rgb(var(--now-color_border--tertiary)) }";
        }
        getStartedWorkflowsData[i].configAria = { "aria-label": gs.getMessage("Browse plugins for {0}", getStartedWorkflowsData[i].name) };
    }

    var creatorWorkflowsLen = creatorWorkflowsData.length;
    var creatorWorkflowData = {};
    var showCreatorWorkflowContainer = false;
    var installPluginModalHeader = "";
    if (creatorWorkflowsLen > 0) {
        creatorWorkflowData = creatorWorkflowsData[0];
        creatorWorkflowData.name = "Now Assist for " + creatorWorkflowData.name;
        creatorWorkflowData.configAria = { "aria-label": gs.getMessage("Get plugin for {0}", creatorWorkflowData.name) };
        showCreatorWorkflowContainer = true;
        installPluginModalHeader = gs.getMessage("Install {0} plugin", creatorWorkflowData.name);
    }

    var faq1Ans = gs.getMessage("What plugins you need depends on your use case. Review each plugin and determine which are relevant to your business needs.");
    var faq1 = "<p style='margin: 0 0 .5rem 0';>" + faq1Ans + "</p>";

    var faq2Ans = gs.getMessage("Skills are tasks accomplished by the Now Assist applications, like record summarization. Features are collections of skills associated with a workflow, such as Now Assist for CSM.");
    var faq2 = "<p style='margin: 0 0 .5rem 0';>" + faq2Ans + "</p>";

    var faq3Ans = gs.getMessage("Yes, the ServiceNow model Now LLM is the default AI provider for Now Assist Features and skills.");
    var faq3 = "<p style='margin: 0 0 .5rem 0';>" + faq3Ans + "</p>";

    return {
        getStartedWorkflowsData: getStartedWorkflowsData,
        showGetStartedContainer: (getStartedWorkflowsLen != 0),
        creatorWorkflowData: creatorWorkflowData,
        showCreatorWorkflowContainer: showCreatorWorkflowContainer,
        installPluginModalHeader: installPluginModalHeader,
        faq1:faq1,
        faq2:faq2,
        faq3:faq3
    };
})(context, pageParams, blockcontext);
