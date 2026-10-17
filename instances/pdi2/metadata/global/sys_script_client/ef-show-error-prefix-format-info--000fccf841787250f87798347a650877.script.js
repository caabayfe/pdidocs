function onLoad() {
    if (!g_form.isNewRecord())
        return;
    
    var gwt = new GwtMessage();
    var message = gwt.getMessage('Error prefix must be in the format SN-<acronym> (e.g., SN-DISC, SN-CMDB, SN-LEAP, SN-IRE)');
    g_form.addInfoMessage(message);
}
