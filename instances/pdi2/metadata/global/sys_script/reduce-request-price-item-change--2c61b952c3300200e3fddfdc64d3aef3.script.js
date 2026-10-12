function onAfter(current, previous) {
	var requestGr = new GlideRecord("sc_request");
	if (!requestGr.get(current.request.sys_id + ""))
		return;
   var request = new SNC.Request(requestGr, previous, current);
   if (request)
      request.recalculateAllPrices();
}
