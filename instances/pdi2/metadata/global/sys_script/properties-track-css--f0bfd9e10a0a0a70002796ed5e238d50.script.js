var name = current.name.toString();
if (name.indexOf('css.') == 0 && name != 'css.version') {
  var now = gs.nowDateTime();
  now = now.replace(" " , "_" );
  gs.setProperty('css.version', now, "CSS Last Modified");
  if (typeof css_message == "undefined") {
    gs.addInfoMessage(gs.getMessage("Refresh the browser to activate style changes"));
    GlideController.putGlobal("css_message", "true");
  }
}
