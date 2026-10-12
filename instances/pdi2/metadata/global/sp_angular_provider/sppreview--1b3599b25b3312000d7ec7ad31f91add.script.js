function($location, $timeout) {

	function getHost() {
		var host = $location.protocol() + '://' + $location.host();
		if ($location.port()) {
			host += ':' + $location.port();
		}
		return host;
	}
	
	function getUrl(sysId) {
		return	getHost() + "/$sp.do?id=sp-preview&sys_id=" + sysId;
	}

	return {
		restrict: 'E',
		scope: {
			options: '='
		},
		replace: true,
		template: '<iframe class="iframe-preview" src="{{url}}"></iframe>',
		link: function($scope, element) {			
						
			$scope.url = getUrl($scope.options);			
			$scope.$on('$sp.preview', function(e, action) {
				if (action === 'reload') {															
					$(element).attr('src', getUrl($scope.options));
				}				
			})			
		}
	}


}
