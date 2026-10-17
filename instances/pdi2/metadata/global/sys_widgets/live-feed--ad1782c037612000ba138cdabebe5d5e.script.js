function sections() {
   return {
      'Live Feed' : { 'type' : 'live_feed_small' }
   };
}

function render() {
   var type = renderer.getPreferences().get("type");
   var gf = new GlideForm(renderer.getGC(), "render_gadget_" + type, 0);
   gf.setDirect(true);
   gf.setRenderProperties(renderer.getRenderProperties());
   return gf.getRenderedPage();
}

function getEditLink() {
   if (!gs.hasRole('admin'))
	   return '';

   return "sys_ui_page.do?sysparm_query=name=render_gadget_" + renderer.getPreferences().get("type");
}
