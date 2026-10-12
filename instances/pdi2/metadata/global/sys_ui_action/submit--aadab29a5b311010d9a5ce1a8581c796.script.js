/** Retrieve the specified param's value from the URL **/
function getParmVal(name) {
    var url = document.URL.parseQuery();
    if (url[name]) {
        var profileID = decodeURI(url[name]);
        return profileID;
    } else {
        return null;
    }
}

function requiredFieldsComplete() {
    var requiredFields = ["name"];
    if (g_form.getValue("handler_type") === "script") {
        requiredFields.push("return_fields");
    }
    if (g_form.getValue("trigger_condition") === "term") {
        requiredFields.push("term");
    }
    for (var i = 0; i < requiredFields.length; i++) {
        var fieldName = requiredFields[i];
        var val = g_form.getValue(fieldName);
        if (val == null || val.length < 1) {
            g_form.addErrorMessage(getMessage("Please fill in all required fields."));
            return false;
        }
    }
    return true;
}

/*
 * Check if a profile sys_id is in the URL, and if so, call a Script Include 
 * to Link this Genius Result to the Profile. Regardless, it will then submit 
 * this new Genius Result Config 
 */
function linkToProfileThenSubmit() {
    if (!requiredFieldsComplete()) {
        return;
    }
    //Show a loading dialog while the async call is made
    var loadingDialog = new GlideDialogWindow("dialog_loading", true);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.setTitle('Loading...');
    loadingDialog.render();

    var profileID = getParmVal('profile');
    var profileIDIsValid = profileID != null && profileID.length > 0;

    if (profileIDIsValid) {
        var grID = g_form.getUniqueValue();

        var ga = new GlideAjax('global.AisProfileLinkingService');
        ga.addParam('sysparm_name', 'linkGeniusResultToProfile');
        ga.addParam('sysparm_profile_id', profileID);
        ga.addParam('sysparm_genius_result_id', grID);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
            } else {
                gs.addErrorMessage(gs.getMessage('Sorry, something went wrong linking the Genius Result to the Profile. Please check the logs or try again later.'));
            }
        });
    } else {
        // No profile ID so just continue submitting the genius result config as usual
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
