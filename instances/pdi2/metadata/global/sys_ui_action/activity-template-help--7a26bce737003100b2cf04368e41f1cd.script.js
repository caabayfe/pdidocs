function openATHelp() {
  var provider = g_form.getValue('wf_element_activity.base_provider');
  if (provider !== "") {
    var url = new GlideURL('context_help.do');
    url.addParam('sysparm_nostack', true);
    url.addParam('sysparm_url', 'wf_element_provider.do');
    url.addParam('sys_id', provider);

    var w = getTopWindow();
    var newWindow = w.open(url.getURL(), "_blank");
    newWindow.focus();
  }
  return false;
}
