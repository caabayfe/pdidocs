(function executeRule(current, previous /*null when async*/) {

  var processTypeUtil = new PDProcessTypeUtil();
  var processTypePublicAccessData = processTypeUtil.getProcessTypesThatAllowPublicAccess();
  g_scratchpad.processTypePublicAccessData = processTypePublicAccessData;

})(current, previous);
