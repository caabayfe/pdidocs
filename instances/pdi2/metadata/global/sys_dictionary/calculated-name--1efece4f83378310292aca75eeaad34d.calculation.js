  (function calculatedFieldValue(current) {
   if (GlideStringUtil.notNil(current.phone_number))
    return current.phone_number;
 
   if (GlideStringUtil.notNil(current.client_table) && GlideStringUtil.notNil(current.client)) {
    var clientRecord = new GlideRecord(current.client_table);
    if (clientRecord.get(current.client))
     return clientRecord.getClassDisplayValue() + ': ' + clientRecord.getDisplayValue();
   }
 
   return gs.getMessage('(empty)');
  })(current);
