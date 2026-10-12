function($rootScope , snAnalytics) {
  /* widget controller */
  var c = this;
	
	if(!(c.data.results) || c.data.results.length ==0) {
	$rootScope.$emit("NO_CATALOG_ITEM");
	}
	
	c.catalogItemOpened = function(title){
		var payload= {};
		payload.name = "Relevant For You";
		payload.data = {};
		payload.data["Catalog Title"] = title;
		snAnalytics.addEvent(payload);
	}
	
}
