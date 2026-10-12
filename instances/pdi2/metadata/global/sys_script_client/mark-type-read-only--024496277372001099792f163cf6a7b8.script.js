function onLoad() {
    if (g_form.isNewRecord())
        return;

    var ajax = new GlideAjax('SystemAddressFilterUtil');
    ajax.addParam('sysparm_name', 'isAssignedToEmailAccount');
    ajax.addParam('sysparm_filter_id', g_form.getUniqueValue());
    ajax.getXML(ajaxCallback);
}

function ajaxCallback(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer == 'true')
        g_form.setReadOnly('type', true);
}
