/** Retrieve the specified param's value from the URL **/
function getParmVal(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function linkToViewConfigThenSubmit() {
    var viewConfigID = getParmVal('config');
    var configIDIsValid = viewConfigID != null && viewConfigID.length > 0;

    if (configIDIsValid && g_form.mandatoryCheck()) {
        //Show a loading dialog while the async call is made
        var loadingDialog = new GlideDialogWindow("dialog_loading", true);
        loadingDialog.setPreference('table', 'loading');
        loadingDialog.setTitle('Loading...');
        loadingDialog.render();
        var actionID = g_form.getUniqueValue();

        var ga = new GlideAjax('global.EvamLinkingService');
        ga.addParam('sysparm_name', 'linkActionToViewConfig');
        ga.addParam('sysparm_config_id', viewConfigID);
        ga.addParam('sysparm_action_id', actionID);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
            } else {
                g_form.addErrorMessage(getMessage('Sorry, something went wrong linking the action to the View config. Please check the logs or try again later.'));
            }
        });
    } else {
        gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
    }
}

if (typeof window == 'undefined')
    runPostLinkingActions();

/** Server-side function to insert the current record and navigate an necessary **/
function runPostLinkingActions() {
    current.insert();
    gs.include('ActionUtils');
    var au = new ActionUtils();
    au.postInsert(current);
}
