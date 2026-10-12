// Only enable group by if list is currently grouped
if (g_list.getGroupBy())
   g_menu.setEnabled(g_item);
else
   g_menu.setDisabled(g_item);
