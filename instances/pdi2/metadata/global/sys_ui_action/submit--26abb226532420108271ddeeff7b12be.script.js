/** Retrieve the specified param's value from the URL **/
function getParmVal(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function linkToEvamThenSubmit() {
    var evamID = getParmVal('evam');
    var evamIDIsValid = evamID != null && evamID.length > 0;

    if (evamIDIsValid && g_form.mandatoryCheck()) {
        //Show a loading dialog while the async call is made
        var loadingDialog = new GlideDialogWindow("dialog_loading", true);
        loadingDialog.setPreference('table', 'loading');
        loadingDialog.setTitle('Loading...');
        loadingDialog.render();
        var dataSourceID = g_form.getUniqueValue();

        var ga = new GlideAjax('global.EvamLinkingService');
        ga.addParam('sysparm_name', 'linkDataSourceToEvam');
        ga.addParam('sysparm_evam_id', evamID);
        ga.addParam('sysparm_data_source_id', dataSourceID);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
            } else {
                g_form.addErrorMessage(getMessage('Sorry, something went wrong linking the data source to the EVAM definition. Please check the logs or try again later.'));
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
