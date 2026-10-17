function($scope, $timeout, $window) {
  /* widget controller */
  var c = this;
	c.show_recent = false;

	c.KEYS = {
						DOWN:40,
						LEFT:37,
						RIGHT:39,
						TAB:9,
						UP:38
					 }

	var tabSelectors = ['div.recent', 'div.popular'];
	function focusTab(recent) {
		var ele;
		if (recent)
			ele = $(tabSelectors[0]);
		else
			ele = $(tabSelectors[1]);

		if (ele)
			ele.focus();
	}

	if (c.data.recentItems.length > 0)
		c.show_recent = true;

	c.changePanel = function(panel_name) {
		if (c.show_recent) {
			if (panel_name == 'popular')
				c.show_recent = false;
		} else {
			if (panel_name == 'recent')
				c.show_recent = true;
		}
	};

	c.switchTab = function($event, tab) {
		var key = null;
		if (event.keyCode === c.KEYS.LEFT || event.keyCode === c.KEYS.UP)
			key = c.KEYS.LEFT;
		else if (event.keyCode === c.KEYS.RIGHT || event.keyCode === c.KEYS.DOWN)
			key = c.KEYS.RIGHT;
		else if (event.keyCode === c.KEYS.TAB) {
			return;
		}
		if (key === null)
			return;

		$event.preventDefault();
		c.show_recent = !c.show_recent;
		focusTab(c.show_recent);
	}

	function handleTooltip() {
		if(!$scope.isTouchDevice()) {
			$timeout(function() {
				$(".item-card").each(function(index) {
					var itemNameElement = $(this).find(".catalog-item-name");
					if(itemNameElement && itemNameElement[0] && itemNameElement.width() < itemNameElement[0].scrollWidth) {
						$(this).attr('data-toggle','tooltip');
					}
				});
			});
		}
	}

	$scope.isTouchDevice = function() {
		return ('ontouchstart' in $window);
	}

	$scope.startItemList = function() {
		handleTooltip();
	}
}
