function($location) {
  
  var c = this;
	c.navigate = function(e) {
		e.stopPropagation();
		e.preventDefault();
		window.location = "/domaincenter?id=running_audit_list";
	}
}
