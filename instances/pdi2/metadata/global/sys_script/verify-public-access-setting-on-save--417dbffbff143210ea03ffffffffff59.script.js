(function executeRule(current, previous /*null when async*/) {

  var currentProcessType = current.getValue(PDConstants.FIELDS.PROCESS_TYPE) || PADConstants.STANDARD_PROCESS_TYPE_SYS_ID;

  var processTypeGr = new GlideRecord(PDConstants.TABLES.PD_PROCESS_TYPE);
  if (processTypeGr.get(currentProcessType)) {
    var publicAccessAllowed = processTypeGr.getValue(PDConstants.FIELDS.ENABLE_PUBLIC_ACCESS) === '1';
    if (publicAccessAllowed) {
      return;
    }
    gs.addErrorMessage(
      gs.getMessage("Public access is not allowed for the selected playbook type")
    );
  } else {
    gs.addErrorMessage(gs.getMessage("Unable to verify the selected playbook type"));
  }

  current.setAbortAction(true);

})(current, previous);
