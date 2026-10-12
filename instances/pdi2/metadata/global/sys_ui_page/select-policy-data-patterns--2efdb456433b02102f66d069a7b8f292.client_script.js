function populateSlushBucket(response) {
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    if (!items || items.length == 0) {
        return;
    }

    var isLeftSlushEnd = false;
    for (var i = 0; i < items.length; i++) {
        var itemValue = items[i].getAttribute('value');
        var itemText = items[i].getAttribute('text');
        if (!isLeftSlushEnd && itemValue === '$=$=END=$=$') {
            isLeftSlushEnd = true;
            continue;
        }
        if (isLeftSlushEnd)
            slush.addRightChoice(itemValue, itemText);
        else
            slush.addLeftChoice(itemValue, itemText);
    }
}

function loadPrefixEvent(prefix) {
    var values = slush.getValues(slush.getRightSelect());
    var window = GlideModal.get();
    var ajax = new GlideAjax('global.PrivacyPolicyDataPatternsAjax');
    ajax.addParam('sysparm_name', 'getPolicyPatternSlushbucketValues');
    ajax.addParam("sysparm_privacy_config_id", window.getPreference('sysparm_privacy_config_id'));
    ajax.addParam('sysparm_config_table', window.getPreference('sysparm_config_table'));
    ajax.addParam('sysparm_right_choice_values', values);
    ajax.addParam("sysparm_search_prefix", prefix);
    ajax.getXML(loadPrefixResponse);
}

function loadPrefixResponse(response) {
    slush.clearSelect(slush.getLeftSelect());
    var xml = response.responseXML;
    var items = xml.getElementsByTagName("item");
    if (!items || items.length == 0) {
        return;
    }
    for (var i = 0; i < items.length; i++) {
        var itemValue = items[i].getAttribute('value');
        var itemText = items[i].getAttribute('text');
        // PrivacyPolicyDataPatternsAjax.LEFT_SLUSH_END_MARKER
if (itemValue === '$=$=END=$=$') {
            break;
        }
        slush.addLeftChoice(itemValue, itemText);
    }
}

function acRequest(event) {
    prefix = event.target.value;
    loadPrefixEvent(prefix);
}

/**
 * Initial load event when GlideModal has loaded. Initiate population of slush values
 */
addLoadEvent(function() {
    slush.clear();
    var window = GlideModal.get();
    var ajax = new GlideAjax('global.PrivacyPolicyDataPatternsAjax');
    ajax.addParam('sysparm_name', 'getPolicyPatternSlushbucketValues');
    ajax.addParam("sysparm_privacy_config_id", window.getPreference('sysparm_privacy_config_id'));
    ajax.addParam('sysparm_config_table', window.getPreference('sysparm_config_table'));
    ajax.getXML(populateSlushBucket);
    return false;
});

function enableDisableSlushActions(enable) {
    document.getElementById('cancel_button').disabled = !enable;
    document.getElementById('ok_button').disabled = !enable;
}

function continueOK() {
	g_form.modified = false;
    enableDisableSlushActions(false);
    var values = slush.getValues(slush.getRightSelect());
    var window = GlideModal.get();
    var ajax = new GlideAjax('global.PrivacyPolicyDataPatternsAjax');
    ajax.addParam('sysparm_name', 'savePolicyPatternPreferences');
    ajax.addParam('sysparm_right_choice_values', values);
    ajax.addParam("sysparm_privacy_config_id", window.getPreference('sysparm_privacy_config_id'));
	ajax.addParam('sysparm_config_table', window.getPreference('sysparm_config_table'));
    ajax.getXMLAnswer(onSlushSaveComplete);
}

/**
 * Event when slushbucket values have saved
 */
function onSlushSaveComplete(response) {
    var genericSaveError = getMessage('Failed to save data patterns.');
    var output = JSON.parse(response);
    // Unlikely!
    if (!output) {
        output = {
            'status': 'error',
            'message': genericSaveError
        };
    }
    if (output.status == 'success') {
        GlideModal.get().destroy();
		location.reload();
        return;
    }
    var message = output.message || genericSaveError;
    g_form.addErrorMessage(message);
    enableDisableSlushActions(true);
    GlideModal.get().destroy();
}

function continueCancel() {
	g_form.modified = false;
    slush.clear();
    GlideModal.get().destroy();
}
