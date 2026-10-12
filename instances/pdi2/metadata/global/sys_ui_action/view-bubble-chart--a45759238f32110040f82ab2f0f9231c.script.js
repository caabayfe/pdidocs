function showBubbleChart() {
  var sysId = typeof rowSysId == 'undefined' ? gel('sys_uniqueValue').value : rowSysId;
  var url = new GlideURL('bubble_scorecard.do');
  url.addParam('sysparm_sysid', sysId );

  var w = getTopWindow();
  var newWindow = w.open(url.getURL(), "_blank");
  newWindow.focus();
  return false;
}
