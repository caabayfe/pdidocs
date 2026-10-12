/**
 * Create a list of user filters for the current table
 */

buildContextActions();

function buildContextActions() {
   // All
   g_contextMenu.addAction("--none--", "-- " + gs.getMessage("None") + " --", 'g_list.setFilterAndRefresh("");', 1);

   var template = 'g_list.setFilter(~!~FILTERNAME~!~, true, true);g_list.refreshWithOrderBy(0);';
   var list = GlideFilterList.get(g_tableName);
   // check for duplicate titles, and for the duplicates use the display title (which includes the visibility)
   var dups = {};
   for (var i = 0; i < list.size(); i++) {
      var filter = list.get(i);
      var title = filter.getTitle();
      if (dups[title])
         dups[title] = 'yes';
      else
         dups[title] = 'no';
   }
   
   var title;
   var script;
   for (var i = 0; i < list.size(); i++) {
      var filter = list.get(i);
      title = filter.getTitle();
      if (dups[title] == 'yes')
         title = filter.getDisplayTitle();
      
      var f = filter.getFilter() + "";
      // remove the trailing EQ if it is there so we can match a query to the filter for the context menu checkmark
      if (f.endsWith("^EQ"))
         f = f.substring(0, f.length - 3);

      // remove any ^EQ^GROUPBY or ^EQ^ORDERBY since the filter code ignores it and we need to match on the filter string
      // when setting the checkmark next to the active filter
      f = f.replace('\^EQ\^GROUPBY', '^GROUPBY');
      f = f.replace('\^EQ\^ORDERBY', '^ORDERBY');
      if (f.startsWith('^GROUPBY') || f.startsWith('^ORDERBY'))
         f = f.substring(1);

      script = template.replace(/FILTERNAME/, f);
	  script = script.replace(/\\/g, "\\\\");
	  script = script.replace(/\"/g, "\\\"");
	  script = script.replace(/~!~/g, '"');
      title = GlideStringUtil.escapeHTML(title);
      g_contextMenu.addAction(f, title, script, i + 2);
   }
}
