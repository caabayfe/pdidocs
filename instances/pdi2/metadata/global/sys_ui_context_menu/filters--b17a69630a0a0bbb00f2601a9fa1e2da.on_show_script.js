// Check the filter that matches the current list query, if there is one that matches
setFilter();

function setFilter() {
   // we want to set the checkmark on this items submenu
   var menu = g_item.subMenu;
   var query = g_list.getQuery({groupby: true});
   if (query.endsWith('^'))
      query = query.substring(0, query.length - 1);

   menu.clearSelected();
   if (query.startsWith('^'))
      query = query.substring(1);

   var item = menu.getItem(query);
   if (item)
      menu.setImage(item, "images/checked.pngx");
}
