function sections() {
   
   var answer = {};

   var gr = new GlideAggregate('cmdb_ci');
   gr.addAggregate('COUNT', 'category');
   gr.query();
   while (gr.next()) {
      var title = gr.category;
      var id = gr.category;
      if (id == null || id == '')
         continue;
      answer[title] = id;
   }
   
   return answer;
   
}

function render() {
  var name = renderer.getPreferences().get("name")
  var gf = new GlideForm(renderer.getGC(), "render_category_counts", 0);
  gf.setDirect(true);
  gf.setRenderProperties(renderer.getRenderProperties());
  return gf.getRenderedPage();
}
