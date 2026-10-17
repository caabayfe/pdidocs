function onAfter(current, previous) {
   var gr = new GlideRecord("sc_req_item");
   gr.addQuery("sys_id", current.sysapproval.sys_id + "");
   gr.query();
   if (gr.next()) {
	   var requestGr = new GlideRecord("sc_request");
	   if (!requestGr.get(gr.request.sys_id + ""))
		   return;
	   var request = new SNC.Request(requestGr);
	   if (request)
         request.recalculateAllPrices();
   }
}
