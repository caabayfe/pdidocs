function onLoad() {

    var gaDisplay = new GlideAjax('MIDLoggedInUserRecords');
    gaDisplay.addParam('sysparm_name', 'shouldDisplayBanner');
    gaDisplay.addParam('sysparm_sys_id', g_form.getUniqueValue());
    gaDisplay.getXMLWait();
    var shouldDisplay = gaDisplay.getAnswer();

    if (shouldDisplay === 'true') {
        g_form.addInfoMessage(getMessage('mid.logged.in.user.banner'));
    }
}

window.handleBanner = function(acknowledge) {
    var recordSysId = g_form.getUniqueValue();
    var ga = new GlideAjax('MIDLoggedInUserRecords');
    ga.addParam('sysparm_name', 'handleBannerFlag');
    ga.addParam('sysparm_sys_id', recordSysId);
    ga.addParam('sysparm_acknowledge', acknowledge);
    ga.getXML(function() {
        g_form.clearMessages();
    });
};
