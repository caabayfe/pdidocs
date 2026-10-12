function(i18n) {
	return {
		template:
		'<div class="text-center end-note" style="text-overflow: ellipsis;" ng-if="data.successMessage && shouldShowSuccessMsg">' +
		    '<h5 class="description-text" ng-bind-html="data.successMessage"></h5>' +
         '</div>' ,
		
		scope: {
			data: '='
		},
		
		controller: function($scope) {
			// DEF0073704: we only show the success message when current page is the last page.
			$scope.$on('update-show-msg', function(event, curState, pagesLength){
				$scope.shouldShowSuccessMsg = curState === pagesLength;
			});
		}
	};
}
