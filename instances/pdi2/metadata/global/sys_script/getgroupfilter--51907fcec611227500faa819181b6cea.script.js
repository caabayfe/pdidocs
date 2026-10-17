//
// this will do a lookup on the group type display values and return
// a query condition that will query on the group type sys_id values
// on entry
//    reference = the table that is being referenced
//    source = the table that contains the reference
//
function GetGroupFilter(types) {
   //
   // By default only use for service_catalog requests
   //
   //if (source != 'sc_request' && source != 'sc_req_item')
   //    return "type=null";

   //
   // turn a non specification into a null request
   //
   if (types == null)
      return "type=null";

   gs.log("GetGroupFilter: Translating '"+types+"' into sys_id values");
   var gt = new GlideRecord("sys_user_group_type");   
   var filters = types.split(",");
   var qc = null;
   for (var i = 0; i < filters.length; i++) {
      if (qc == null)
         qc = gt.addQuery("name", filters[i]);
      else
         qc.addOrCondition("name", filters[i]);
   }
   var gtr = new GlideRecord("sys_user_group");
   gt.query();
   qc = null;
   while (gt.next()) {
      if (qc == null)
         qc = gtr.addQuery("type", gt.sys_id);
      else
         qc.addOrCondition("type", "CONTAINS", gt.sys_id);
      
   }
   return qc;
}
