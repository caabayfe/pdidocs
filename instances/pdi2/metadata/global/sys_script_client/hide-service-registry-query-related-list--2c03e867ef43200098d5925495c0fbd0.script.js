function onLoad() {
   // super menus do not use menu items, rather they contain another menu so hide the list of menu items
   var name = g_form.getValue("name");
   if (name != "wbem")
      g_form.hideRelatedList("service_reg_query");
}
