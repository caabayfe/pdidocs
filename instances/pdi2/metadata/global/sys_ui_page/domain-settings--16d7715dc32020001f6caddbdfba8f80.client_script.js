$('referer').value = document.location;

function showPropertyContext(event, id) {
     var mcm = new GwtContextMenu('context_menu_property_' +id);
     mcm.clear();
     mcm.addURL("${gs.getMessage('Edit Property')}", "sys_properties.do?sysparm_query=name=" + id, "gsft_main");
     mcm.addHref("${gs.getMessage('Copy Name To Clipboard')}", "copyToClipboard('" + id + "')");
     return contextShow(event, mcm.getID(), 500, 0, 0);
}
