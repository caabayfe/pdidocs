// printing from a list
function printPreviewList(sysid) {
  var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";

  var href = "incident.do?sysparm_stack=no&sysparm_media=print&sys_id=" + sysid;

  win = window.open(href, "Printer_friendly_format", features);
  win.focus();
}
