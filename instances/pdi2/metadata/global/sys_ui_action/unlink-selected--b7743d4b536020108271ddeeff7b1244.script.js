var selectedRowIDs;
var configSysID;

function unlinkSelectedActions() {
    // Alert the user if nothing is selected
    if (g_list.getChecked().length < 1) {
        alert("You have not selected any Actions to unlink from this View configuration.");
    } else {
        //Show a loading dialog while the async call is made
        var loadingDialog = new GlideDialogWindow("dialog_loading", true);
        loadingDialog.setPreference('table', 'loading');
        loadingDialog.setTitle('Loading...');
        loadingDialog.render();
        selectedRowIDs = g_list.getChecked();
        configSysID = g_list.getSubmitValue('sysparm_collectionID');
        var ga = new GlideAjax('global.EvamLinkingService');
        ga.addParam('sysparm_name', 'unlinkActions');
        ga.addParam('sysparm_config_id', configSysID);
        ga.addParam('sysparm_action_ids', selectedRowIDs);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                loadingDialog.destroy();
                location.reload();
            } else {
                gs.addErrorMessage(gs.getMessage('Sorry, something went wrong while unlinking those actions. Please check the logs or try again later.'));
            }
        });
    }
}
