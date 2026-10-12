function sections() {
    return {
      'Performance Dashboards' : { 'name' : 'performance_dashboards_iframe' }
    };
}

function render() {
  var name = renderer.getPreferences().get("name");
  var gf = new GlideForm(renderer.getGC(), name, 0);
  gf.setDirect(true);
  gf.setRenderProperties(renderer.getRenderProperties());
  return gf.getRenderedPage();
}

function getEditLink() {
  return "";
}
