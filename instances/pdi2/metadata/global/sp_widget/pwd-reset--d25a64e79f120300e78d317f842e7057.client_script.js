function($scope, $location) {
  /* widget controller */
	var c = this;
	var url = "/$pwd_reset.do?sysparm_url=ss_default";

	var urlParams = $location.search();
	
	 for (var key in urlParams) {
		 if (key == 'sysparm_redirect_url') 
			 url += '&sysparm_redirect_url=' + urlParams[key];
		 
		 if (key == 'sysparm_show_custom_header_footer')
			 url += '&sysparm_show_custom_header_footer=' + urlParams[key];
			 
	 }
	
	$scope.iframeUrl = url;
}
