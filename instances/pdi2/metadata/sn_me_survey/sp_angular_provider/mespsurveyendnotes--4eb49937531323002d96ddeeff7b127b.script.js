function(i18n) {
	return {
		template:
		'<div class="text-center" style="text-overflow: ellipsis;" ng-if="data.successMessage">' +
		    '<h5 class="description-text" ng-bind-html="data.successMessage"></h5>' +
         '</div>' ,
		
		scope: {
			'data': '='
		}
	};
}
