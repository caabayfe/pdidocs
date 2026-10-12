function($rootScope, $timeout) {
  // widget controller
  var c = this;
	var bc = [{label: c.data.widgetTitle, url: '#'}];
	$timeout(function() {
		$rootScope.$broadcast('sp.update.breadcrumbs', bc);
	});
	
	function handleToolTip() {
		$timeout(function() {
			$(".tool-tip-title").each(function(index) {
				if (this.offsetWidth >= this.scrollWidth) {
					$(this).removeAttr("title");
					$(this).removeAttr("data-original-title");
				}
			});
		}, 100);
	}
	
	handleToolTip();
	
	$timeout(function() {
		$('.survey-title a').first().focus();
	});

	$(document).on('mousedown', ".survey-title a[aria-describedby]", function() {
    	$(".survey-title a[aria-describedby]").tooltip('hide');
	});
}
