function onClick(g_form) {
    var sysId = g_form.getUniqueValue();

    function doCancel() {
        var ga = new GlideAjax('global.ContractManagementUtilsAJAX');
        ga.addParam('sysparm_name', 'cancelContract');
        ga.addParam('sysparm_sys_id', sysId);
        ga.getXML(parseResponse);
    }

    function parseResponse() {
        g_form.reload();
    }

    var title = getMessage('Confirmation');
    var msg = getMessage('Cancel this contract?');
    var cancelLabel = getMessage('No');
    var confirmationLabel = getMessage('Yes');
    g_modal.confirm(
        title,
        msg,
        function(response) {
            if (response) {
                doCancel();
            }
        }, {
            cancelTitle: cancelLabel,
            confirmTitle: confirmationLabel,
        }
    );
}
