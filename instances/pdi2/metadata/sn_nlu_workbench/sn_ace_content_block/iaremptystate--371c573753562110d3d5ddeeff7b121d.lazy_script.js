(function(context, pageParams, blockcontext) {
    /**
     * 1. IAR Plugin not installed.
     * 2. IAR Plugin installed but version less than 9.0(which contains IAR Model)
     * 3. IAR Plugin installed but model is not trained
     * */

    var IAR_PLUGIN_VERSION_NUMBER = 8.1;

    var IAR_TABLE = "incident";
    var IAR_LANGUAGE = "en";

    var GET_PLUGIN = gs.getMessage("Get plugin");
    var UPDATE_PLUGIN = gs.getMessage("Update plugin");
    var TRAIN_MODEL = gs.getMessage("Train model");
    var PLUGIN_BUTTON_LINK = "https://store.servicenow.com/sn_appstore_store.do#!/store/application/0f3b8e580b203300a1b16c2367673a75";
    var TRAIN_BUTTON_LINK = "/now/conversation/iar/home";
    var PLUGIN_SUBTITLE = gs.getMessage("<p>To begin using models for Issue Auto Resolution, download or update the ITSM NLU Model for Virtual Agent Conversations plugin. After that, you’ll need to train a model in the <now-text-link label='IAR Admin Console' href='/now/conversation/iar/home' variant='secondary' opens-window ></now-text-link></p>");
    var TRAIN_MODEL_SUBTITLE = gs.getMessage("<p>To begin using models for Issue Auto Resolution, train a model in the IAR Admin Console.</p>");

    var subtitle = PLUGIN_SUBTITLE;
    var buttonLabel = GET_PLUGIN;
    var buttonLink = PLUGIN_BUTTON_LINK;
    var enableIarEmptyState = true;
    var disableIarEmptyState = false;

    var versionGR = new GlideRecord('sys_store_app');
    versionGR.addQuery('scope', 'sn_itsm_nlu');
    versionGR.query();
    if (versionGR.next()) {
        if (parseFloat(versionGR.version) < IAR_PLUGIN_VERSION_NUMBER)
            buttonLabel = UPDATE_PLUGIN;
        else {
            var result = global.AutoResolutionAPI.isTrainedWorkflowSolutionAvailable(IAR_TABLE, IAR_LANGUAGE);
            if (result.trained_solution === true) {
                enableIarEmptyState = false;
                disableIarEmptyState = true;
            } else {
                subtitle = TRAIN_MODEL_SUBTITLE;
                buttonLabel = TRAIN_MODEL;
                buttonLink = TRAIN_BUTTON_LINK;
            }
        }
    }

    return {
        enableIarEmptyState: enableIarEmptyState,
        disableIarEmptyState: disableIarEmptyState,
        subtitle: subtitle,
        buttonLabel: buttonLabel,
        buttonLink: buttonLink
    };

})(context, pageParams, blockcontext);
