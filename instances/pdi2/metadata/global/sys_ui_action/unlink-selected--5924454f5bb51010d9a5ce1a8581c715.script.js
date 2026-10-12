var selectedRowIDs;
var profileSysID;

function unlinkSelectedSearchSources() {
    // Alert the user if nothing is selected
    if (g_list.getChecked().length < 1) {
        alert("You have not selected any Search Sources to unlink from this profile.");
    } else {
        //Show a loading dialog while the async call is made
        var loadingDialog = new GlideDialogWindow("dialog_loading", true);
        loadingDialog.setPreference('table', 'loading');
        loadingDialog.setTitle('Loading...');
        loadingDialog.render();
        selectedRowIDs = g_list.getChecked();
        profileSysID = g_list.getSubmitValue('sysparm_collectionID');
        var ga = new GlideAjax('global.AisProfileLinkingService');
        ga.addParam('sysparm_name', 'unlinkSearchSources');
        ga.addParam('sysparm_profile_id', profileSysID);
        ga.addParam('sysparm_search_source_ids', selectedRowIDs);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                loadingDialog.destroy();
                location.reload();
            } else {
                gs.addErrorMessage(gs.getMessage('Sorry, something went wrong while unlinking those Search Sources. Please check the logs or try again later.'));
            }
        });
    }
}
