function acRequest(event) {
    prefix = event.target.value;
    loadPrefixEvent(prefix);
}

function continueOK() {
    enableDisableSlushActions(false);
    var values = slush.getValues(slush.getRightSelect());
    var window = GlideModal.get();
    var ajax = new GlideAjax('global.DeleteDomainUtilsAjax');
	ajax.addParam('sysparm_name', 'saveSlushbucketPreferences');
    ajax.addParam('sysparm_right_choice_values', values);
    ajax.getXMLAnswer(onSlushSaveComplete);
}

function onSlushSaveComplete(response) {
    var genericSaveError = 'Failed to save user_sources.';
    var output = JSON.parse(response);
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
    showError(message);
    enableDisableSlushActions(true);
    GlideModal.get().destroy();
}

function continueCancel() {
    GlideModal.get().destroy();
}

addLoadEvent(function() {
    slush.clear();
    var window = GlideModal.get();
    var ajax = new GlideAjax('global.DeleteDomainUtilsAjax');
    ajax.addParam('sysparm_name', 'setItemWithTableData');
    ajax.addParam('sysparm_left_table', window.getPreference("leftTable"));
    ajax.addParam('sysparm_right_table', window.getPreference("rightTable"));
    ajax.addParam('sysparm_reference_field', window.getPreference("referenceField"));
    ajax.addParam('sysparm_leftKey', window.getPreference("leftKey"));
    ajax.addParam('sysparm_textField', window.getPreference("textField"));
    ajax.getXML(populateSlushBucket);
    return false;
});

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
        if (!isLeftSlushEnd && itemValue === '==END==') {
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
    var ajax = new GlideAjax('global.DeleteDomainUtilsAjax');
    ajax.addParam('sysparm_name', 'setItemWithTableData');
    ajax.addParam('sysparm_right_choice_values', values);
    ajax.addParam('sysparm_left_table', window.getPreference("leftTable"));
    ajax.addParam('sysparm_right_table', window.getPreference("rightTable"));
    ajax.addParam('sysparm_reference_field', window.getPreference("referenceField"));
    ajax.addParam('sysparm_leftKey', window.getPreference("leftKey"));
    ajax.addParam('sysparm_textField', window.getPreference("textField"));
    ajax.addParam("sysparm_prefix", prefix);
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
        if (itemValue === '==END==') break;
        slush.addLeftChoice(itemValue, itemText);
    }
}

function enableDisableSlushActions(enable) {
    document.getElementById('cancel_button').disabled = !enable;
    document.getElementById('ok_button').disabled = !enable;
}

function showError(errorMessage) {
    $("notification-error").show();
    $("notification-error-message").innerHTML = errorMessage;
}
