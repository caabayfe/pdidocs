function getParmVal(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Client Side function called on click
function saveForm() {
  if(g_form.mandatoryCheck()) {
        var bundleID = g_form.getUniqueValue();
        var evamID = getParmVal('evam');
        var ga = new GlideAjax('global.EvamLinkingService');
        ga.addParam('sysparm_name', 'linkConfigBundleToEvam');
        ga.addParam('sysparm_evam_id', evamID);
        ga.addParam('sysparm_bundle_id', bundleID);
        ga.getXML(function(response) {
            var answer = response.responseXML.documentElement.getAttribute("answer");
            if (answer == 'ok') {
                 g_form.save();
            } else {
                g_form.addErrorMessage(getMessage('Sorry, something went wrong linking the Config bundle to the EVAM definition. Please check the logs or try again later.'));
            }
		});
  }
  else
        g_form.save();
}
