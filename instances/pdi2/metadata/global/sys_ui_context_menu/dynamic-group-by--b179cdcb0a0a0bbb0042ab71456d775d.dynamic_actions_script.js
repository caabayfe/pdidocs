/**
 * Create a list of fields for the current table
 */
buildContextActions();

function buildContextActions() {
   g_contextMenu.addAction("--none--", "-- " + gs.getMessage("None") + " --", "groupList('');", 0);
   var groupTag = new GlideGroupByListTag();
   var fields = groupTag.getFields(ListProperties.getTable(), 'false');
   var sm = GlideSecurityManager.get();
   
   for (var i = 0; i < fields.size(); i++) {
      var field = fields.getChoice(i);
	  var url = "record/" + ListProperties.getTable() + '.' + field.getValue() + "/add_to_list";
      var canAdd = sm.hasRightsTo(url,null);
      
	  if (canAdd)
         g_contextMenu.addAction(field.getValue(), field.getLabel(), "groupList('" + field.getValue() + "');", i + 1);
   }
}
