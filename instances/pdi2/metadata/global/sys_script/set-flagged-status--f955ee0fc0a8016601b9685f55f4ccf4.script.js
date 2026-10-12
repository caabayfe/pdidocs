if(current.operation() == "delete" || current.flagged.changes())
    setArticleFlag();

function setArticleFlag() {
   var gr = new GlideRecord("kb_knowledge");
   if (!gr.get(current.article))
      return;

   if (current.flagged == "true" && current.operation() != "delete")
      gr.flagged = "true";
   else {
      var ga = new GlideAggregate("kb_feedback");
      ga.addAggregate("COUNT");
      ga.addQuery("article", current.article);
      ga.addQuery("flagged", "true");
      ga.query();
      var count = 0;
      if (ga.next())
         count = ga.getAggregate("COUNT");
      
      gr.flagged = count > 0;
   }
   gr.autoSysFields(false);
   gr.update();
}
