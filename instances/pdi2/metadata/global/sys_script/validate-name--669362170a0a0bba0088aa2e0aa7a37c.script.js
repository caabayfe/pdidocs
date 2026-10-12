validateDatabaseViewName();

function validateDatabaseViewName() {
   var s = current.name.toString();
   s = s.toLowerCase();
   s = s.replace(/[^a-zA-Z0-9_]/g, '_');

   var isGlobalNonMaint = (gs.getCurrentApplicationScope() == "global") && (!gs.hasRole("maint"));
   var doesntHaveUPrefixAlready = (s.indexOf("u_") != 0)
   if (isGlobalNonMaint && doesntHaveUPrefixAlready)
      s = "u_" + s;

   var gr = new GlideRecord(s);
   if (gr.isValid()) {
      current.setAbortAction(true);
      gs.addInfoMessage(gs.getMessage("Table name") + " " + s + " " + gs.getMessage("already exists"));
      return;
   }
   gr = new GlideRecord("sys_db_view");
   gr.addQuery("name", s);
   gr.query();
   if (gr.next()) {
      current.setAbortAction(true);
      gs.addInfoMessage(gs.getMessage("Database View name") + " " + s + " " + gs.getMessage("already exists"));
      return;
   }
   current.name = s;
}
