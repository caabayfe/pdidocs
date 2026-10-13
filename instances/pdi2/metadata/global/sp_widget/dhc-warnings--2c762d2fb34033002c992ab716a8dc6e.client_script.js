function($location) {
  
  var c = this;
	c.navigate = function(e) {
		e.stopPropagation();
		e.preventDefault();
		window.location = "/domaincenter?id=warning_list";
	}
}
