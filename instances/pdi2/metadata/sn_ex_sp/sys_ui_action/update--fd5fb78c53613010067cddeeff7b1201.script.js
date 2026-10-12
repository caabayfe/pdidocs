var isPrimary = current.primary;
if (isPrimary) {
    var recordSysID = current.sys_id;
    var utils = new sn_ex_sp.ActivityConfigurationUtil();
    var isValid = utils.isValidPrimaryActivity(recordSysID);
    if (!isValid) {
        action.setRedirectURL(current);
        current.update();
        gs.addInfoMessage(gs.getMessage("Please update the activity configuration detail mappings to get the list view"));
    } else
        current.update();

} else {
    current.update();
}
