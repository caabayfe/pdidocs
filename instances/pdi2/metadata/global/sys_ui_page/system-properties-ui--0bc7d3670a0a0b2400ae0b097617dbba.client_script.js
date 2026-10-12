var url = new GlideURL();
url.setEncode(false);
url.setFromCurrent();
url.deleteParam('sysparm_record_scope');
$('referer').value = url.getURL();

function showPropertyContext(event, id) {
     var mcm = new GwtContextMenu('context_menu_property_' +id);
     mcm.clear();
     mcm.addURL("${gs.getMessage('Edit Property')}", "sys_properties.do?sysparm_query=name=" + id, "gsft_main");
     mcm.addHref("Copy Name To Clipboard", "copyToClipboard('" + id + "')");
     return contextShow(event, mcm.getID(), 500, 0, 0);
}

function upgradeColor(id) {
    var d = $(id);
    var e = $('example.' + id);
    if (!d || !e)
        return;

    var color = d.value;
    try {
        e.style.backgroundColor = color;
    } catch (ex) {
        alert('Invalid color: ' + color);
        d.value = '';
        e.style.backgroundColor = 'white';
    }
}

//WCAG: Focusing save button, once page is loaded
document.getElementById('saveBtn').focus();
