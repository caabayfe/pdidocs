new DiscoverySensor({
    process: function(result) {

    if (gs.nil(result.output))
        return;

    this.debug("In ServiceDiscoverySensor");
	
    var resultHandler = new SNC.ServiceWatchInitialDiscoveryResultHandler();

    resultHandler.handleResult(g_probe);   
    },

   /*
   * in case we have an error on the input record, we still want to call the java handler
   * since we want the error to appear on the map. this method overrides the one in DiscoverySensor
   */
   checkErrorPayload: function(result) {
	   	var error = this.getAttribute(result, 'error');
        if (error) {
			DiscoverySensor.prototype.checkErrorPayload.apply(this, arguments);
		    var resultHandler = new SNC.ServiceWatchInitialDiscoveryResultHandler();
            resultHandler.handleResult(g_probe) ; 
            return true;
        }
	   return false;

   },
    type: "DiscoverySensor"
});
