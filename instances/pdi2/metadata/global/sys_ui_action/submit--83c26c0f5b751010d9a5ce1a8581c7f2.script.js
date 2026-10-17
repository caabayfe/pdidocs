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

/*
 * Check if a profile sys_id is in the URL, and if so, call a Script Include 
 * to link this new Search Source to the Profile. Regardless, it will then submit 
 * this new Search Source
 */
function linkToProfileThenSubmit() {
    var name = g_form.getValue("name");

    if (name == null || name.length == 0) {
        g_form.addErrorMessage(getMessage("A name must be specified before submitting."));
        return;
    }

    var datasourceId = g_form.getValue("datasource");

    if (datasourceId == null || datasourceId.length == 0) {
        g_form.addErrorMessage(getMessage("An Indexed Source must be specified before submitting."));
        return;
    }

    var profileID = getParmVal('profile');
    var profileIDIsValid = profileID != null && profileID.length > 0;

    if (profileIDIsValid) {
        //Show a loading dialog while the async call is made
        var loadingDialog = new GlideDialogWindow("dialog_loading", true);
        loadingDialog.setPreference('table', 'loading');
        loadingDialog.setTitle('Loading...');
        loadingDialog.render();

        var searchSourceID = g_form.getUniqueValue();

        var ga = new GlideAjax('global.AisProfileLinkingService');
        ga.addParam('sysparm_name', 'linkSearchSourceToProfile');
        ga.addParam('sysparm_profile_id', profileID);
        ga.addParam('sysparm_search_source_id', searchSourceID);
        var dsGr = new GlideRecord('ais_datasource');
        dsGr.addQuery('source', g_form.getValue('datasource'));
        dsGr.query();
        ga.addParam('sysparm_is_external', dsGr.next() && dsGr.type + '' == 'external');
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert');
            } else {
                g_form.addErrorMessage(getMessage('Sorry, something went wrong linking the search source to the Profile. Please check the logs or try again later.'));
            }
        });
    } else {
        // No profile ID so just continue submitting the search source config as usual
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
