function onLoad() {
   // super menus do not use menu items, rather they contain another menu so hide the list of menu items
   var st = g_form.getValue("sensor_type");
   if (st != "XML")
      g_form.hideRelatedList("sys_impex_entry");
}
