function onLoad() {
    var gwt = new GwtMessage();
    var message = gwt.getMessage('Click on "Configuration Help" for more information on configuration parameters');
    g_form.addInfoMessage(message);
}
