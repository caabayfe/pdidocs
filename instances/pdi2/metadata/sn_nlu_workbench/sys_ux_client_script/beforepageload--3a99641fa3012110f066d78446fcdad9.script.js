/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {

    let blockcontext = api.state.blockcontext;
    blockcontext.modelDomain = [];
    blockcontext.preBuiltModelIntents = [];
    blockcontext.machineTranslateSelected = false;
    blockcontext.thirdPartyTranslateSelected = false;
    blockcontext.noTraslationSelected = true;
    blockcontext.disableAddALanguage = true;
    blockcontext.iUnderstandChecked = false;
    blockcontext.showTextForThirdPartyMode = false;
    blockcontext.showTextForAIMode = false;
    blockcontext.fileUploading = false;

    blockcontext.enableIarEmptyTab = true;
    blockcontext.disableIarEmptyTab = false;
    blockcontext.isVaPluginInstalled = false

    blockcontext.vaIsOOB = false;
    blockcontext.iarIsOOB = true;
    blockcontext.aisIsOOB = true;

    blockcontext.vaRowDefinition = {};
    blockcontext.iarRowDefinition = {};
    blockcontext.aisRowDefinition = {};

    blockcontext.vaTotalRecords = 0;
    blockcontext.iarTotalRecords = 0;
    blockcontext.aisTotalRecords = 0;
    blockcontext.vaPageNumber = 0;
    blockcontext.iarPageNumber = 0;
    blockcontext.aisPageNumber = 0;
    
    const showPredictionServerNotification = blockcontext.showPredictionServerNotification;
    if (showPredictionServerNotification) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: "prediction-server-alert",
                status: "critical",
                icon: "circle-close-fill",
                content: "Some features may not be available because the connection to NLU Service is not available. Please try again after sometime, if the issue persists log an issue with Support",
                action: {
                    type: "dismiss"
                }
            }]
        });
    }
    api.emit('ACE_PAGE_READY', {
        blockcontext
    });
}
