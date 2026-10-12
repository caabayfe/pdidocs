function spToolTip($compile) {
	return {
		restrict: 'A',
		link: function($scope, element, attrs, ctrl) {
			$(element).one('mouseover', function(e) {
				if (!attrs.tooltips) {
					$(e.target).attr('tooltips', true);
					$compile(element)($scope);
				} 
			});
		}
	}
}
