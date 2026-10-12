function sections() {
    return {
      'World Clocks' : { 'name' : 'example_cool_clock' }
    };
}

function render() {
  var name = renderer.getPreferences().get("name")
  var gf = new GlideForm(renderer.getGC(), name, 0);
  gf.setDirect(true);
  gf.setRenderProperties(renderer.getRenderProperties());
  return gf.getRenderedPage();
}

function getEditLink() {
  if (!gs.hasRole('admin'))
     return '';

  return "sys_ui_page.do?sysparm_query=name=" + renderer.getPreferences().get("name");
}
