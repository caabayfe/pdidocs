function onChange(control, oldValue, newValue, loading) {
   var listTableName = "discovery_range_item_ip";
   if (newValue == "IP Address List")
      g_form.showRelatedList(listTableName);
   else
      g_form.hideRelatedList(listTableName);
}
