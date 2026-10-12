function($scope, spUtil, $element, $window) {
	var c = this;
	$element.hide();
	var height = c.options.height_from_top || 300;
	height = parseInt(height);
	var lastScrollTop = 0;
	var container = angular.element('.sp-scroll');
	var windowElement = angular.element($window);
	var handleScroll = function(e) {
		var target = e.target;
		var currentScroll = angular.element(target).scrollTop();
		if(lastScrollTop > currentScroll && lastScrollTop > height && currentScroll > height) // moving up
			$element.show();
		else
			$element.hide();
		lastScrollTop = currentScroll;
	}
	container.on("scroll", handleScroll); // for large screen
	windowElement.on("scroll", handleScroll); // for small screens


	$scope.goTop = function() {
		var animationDuration = 300;
		if($window.scrollY > 0) {
			$('html').animate({
				scrollTop : 0
			}, animationDuration);
		} else {
			spUtil.scrollTo('.sp-scroll', animationDuration);
		}
	}

}
