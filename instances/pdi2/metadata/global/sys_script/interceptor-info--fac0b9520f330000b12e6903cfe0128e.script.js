checkInterceptor();

function checkInterceptor() {
   var path;
   if (current.link_type == "NEW")
      path = current.name + ".do";
   else {
      var s = current.query.toString();
      if (s.indexOf("sys_id=-1") == -1)
         return;
   
      var idx = s.indexOf("?");
      if (idx > -1)
         path = s.substring(0, idx);
      else
         path = s;
   }
   
   if (path == "")
      return;

   var gr = new GlideRecord('sys_wizard_answer');
   gr.addActiveQuery();
   gr.addQuery("question.intercepts", path);
   gr.query();
   if (gr.getRowCount() > 0)
      gs.addInfoMessage(gs.getMessage("There is an active Interceptor defined for this table (System Definition > Interceptors)"));
}
