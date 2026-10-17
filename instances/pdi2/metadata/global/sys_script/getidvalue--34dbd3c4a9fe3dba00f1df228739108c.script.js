// Return the sys_id value for a given table and its display value
//
function GetIDValue(table, displayValue) {
   var rec = new GlideRecord(table);
   var dn = gs.getDisplayColumn(table);
   if (rec.get(dn, displayValue))
      return rec.sys_id;
   else
      return null;
}
