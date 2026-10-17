function($rootScope , snAnalytics) {
  /* widget controller */
  var c = this;
	
	
	if(!(c.data.response) || c.data.response.length ==0) {
	$rootScope.$emit("NO_ARTICLE");
	}
	
	c.articleOpened = function(title){
		var payload= {};
		payload.name = "Relevant For You";
		payload.data = {};
		payload.data["Article Title"] = title;
		snAnalytics.addEvent(payload);
	}
	
}
