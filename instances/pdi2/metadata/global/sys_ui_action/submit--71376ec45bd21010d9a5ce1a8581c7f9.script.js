/*
 * Check if a profile sys_id is in the URL, and if so, call a Script Include 
 * to link this new Search Source to the Profile. Regardless, it will then submit 
 * this new Search Source
 */
function linkToProfileThenSubmit() {
	
    if (g_form.getValue("type") == "STOPWORD" && g_scratchpad.dictionaryLocales != null && g_scratchpad.dictionaryLocales.includes(g_form.getValue("locale"))) {
        g_form.addErrorMessage("There is already a Stop Words dictionary for the selected language. You are only allowed one Stop Words dictionary per language");
        return false;
    }

    if (!labelIsValid()) {
        g_form.addErrorMessage("You can't submit until all required fields are filled in");
        return false;
    }

    //Show a loading dialog while the async call is made
    var loadingDialog = new GlideDialogWindow("dialog_loading", true);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.setTitle('Loading...');
    loadingDialog.render();

    var profileID = g_scratchpad.ais_profile_id;
    var profileIDIsValid = profileID != null && profileID.length > 0;
    if (profileIDIsValid) {
        var dictionaryID = g_form.getUniqueValue();

        var ga = new GlideAjax('global.AisProfileLinkingService');
        ga.addParam('sysparm_name', 'linkDictionaryToProfile');
        ga.addParam('sysparm_profile_id', profileID);
        ga.addParam('sysparm_dictionary_id', dictionaryID);
        ga.addParam('sysparm_dictionary_name', g_form.getValue('name'));
        try {
            ga.getXML(function(response) {
                var answer = response.responseXML.documentElement.getAttribute("answer");
                if (answer == 'ok') {
                    g_form.save();
                } else if (answer == 'duplicate') {
                    g_form.showFieldMsg('name', 'Dictionary already exists', 'error');
                    loadingDialog.destroy();
                } else {
                    g_form.addErrorMessage('Sorry, something went wrong linking the Genius Result to the Profile. Please check the logs or try again later.');
                }
            });
        } catch (e) {
            g_form.addErrorMessage('Sorry, something went wrong linking the Genius Result to the Profile. Please check the logs or try again later. Error Message: ' + answer);
        }

    } else {
        g_form.save();
    }
}

function labelIsValid() {
    return g_form.getValue('label') != null && g_form.getValue('label').trim().length > 0;
}
