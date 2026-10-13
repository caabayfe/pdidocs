function onChange(control, oldValue, newValue, loading) {
   var listTableName = "discovery_range_item_zone";
   if (newValue == "Zone Transfer")
      g_form.showRelatedList(listTableName);
   else
      g_form.hideRelatedList(listTableName);
}
