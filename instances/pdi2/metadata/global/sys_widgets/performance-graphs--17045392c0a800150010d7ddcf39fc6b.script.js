function sections() {
   
   var answer = {};

   var gr = new GlideRecord('jrobin_graph');
   gr.orderBy('title');
   gr.query();
   while (gr.next()) {
      var title = gr.title + '';
      var id = gr.sys_id + '';
      
      // get the databases that can be graphed with this graph
      var hasDBs = false;
      var dbNames = {};
      var grDB = new GlideRecord('jrobin_database');
      grDB.addQuery('definition', gr.jrobin_definition);
      grDB.query();
      while (grDB.next()) {
         hasDBs = true;
         var db = {};
         db.db_id = grDB.sys_id + '';
         db.db_name = grDB.name + '';
         db.graph_id = gr.sys_id + '';
         var t = grDB.name;
         if (grDB.cmdb_ci) {
            var g = new SncJRobinGraphDef(gr.sys_id, grDB.name);
            t = g.getTitleText();
         }
         dbNames[t] = db;
      }
      if (hasDBs)
         answer[title] = dbNames;
   }
   
   return answer;
   
}

function render() {
   var gf = new GlideForm(renderer.getGC(), "render_jrobin_graph", 0);
   gf.setDirect(true);
   gf.setRenderProperties(renderer.getRenderProperties());
   return gf.getRenderedPage();
}

function getEditLink() {
        if (!gs.hasRole('admin'))
             return '';

        return "sys_ui_page.do?sysparm_query=name=render_jrobin_graph"; 
}
