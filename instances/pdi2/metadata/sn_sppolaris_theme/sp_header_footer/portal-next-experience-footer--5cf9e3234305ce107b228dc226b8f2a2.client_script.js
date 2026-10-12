api.controller = function($scope, $window, $location, snAnalytics) {
	/* widget controller */
	var c = this;
	var isIE = window.navigator.userAgent.indexOf('Trident/') !== -1;
	c.masonryCellCSS = {};
	c.sfLogoContainerCSS = {};
	c.sfLogoCSS = {};
	c.sfBottomLeftCSS = {};
	c.sfBottomRightCSS = {};
	c.sfSocialIconsCSS = {};

    function init() {
        if (window.screen.width < 1024)
            c.data.smallScreen = true;
        setTimeout(function() {
            applyMasonryOnLoad();
        });
    }

	var applyMasonryOnLoad = function() {
		var masonryRoot = $('.masonry-root');
		var maxColumns = hasNestedItems(c.data.footer.menus.navigation_links) ? 5: 8;
		var noOfColumns =Math.min( Math.floor(masonryRoot.innerWidth() / convertRemToPixel(minimumWidthRem())), maxColumns);
		var masonryCell = masonryRoot.children();
		var masonryCellSize = masonryCell.size();
		if (masonryCellSize > 0) {
			var flexBasisVal = noOfColumns > masonryCellSize ? (100 / masonryCellSize + '%') : (100 / noOfColumns + '%');
			c.masonryCellCSS = {};
			c.masonryCellCSS['flex-grow'] = '0';
			c.masonryCellCSS['flex-shrink'] = '0';

			if (isIE) {
				c.masonryCellCSS['flex-grow'] = '1';
				c.masonryCellCSS['flex-basis'] = 'auto';
				c.masonryCellCSS['max-width'] = flexBasisVal;
			} else
				c.masonryCellCSS['flex-basis'] = flexBasisVal;
		}
		if (!c.data.smallScreen) {
			if (!c.data.footer.logo.content) {
				c.sfLogoContainerCSS.padding =  '1rem 2rem';
				c.sfLogoCSS['max-height'] = '4rem';
			}
			if (!c.data.footer.menus.navigation_links.length) {
				c.sfBottomLeftCSS['display'] =  'flex';
				c.sfBottomLeftCSS['flex-basis'] =  '40%';
				c.sfLogoContainerCSS['width'] =  '100%';
				c.sfBottomRightCSS['align-items'] = 'flex-end';
				c.sfBottomRightCSS['padding-bottom'] = '1rem';
				c.sfLogoCSS['max-height'] = '8rem';
			}
		}
		if(c.data.footer.menus.social_icons_color){
			c.sfSocialIconsCSS['color'] = c.data.footer.menus.social_icons_color;
		}
	};

    function minimumWidthRem() {
        var minColWidth = 22;
        if ($window.innerWidth <= 700)
            minColWidth = 15; //mobile
        if ($window.innerWidth > 700 && $window.innerWidth <= 820)
            minColWidth = 20; //tablet
        if ($window.innerWidth > 820 && $window.innerWidth < 1060)
            minColWidth = 15; //laptop
        return minColWidth;
    }

    function convertRemToPixel(rem) {
        return rem * 10;
    }

    var hasNestedItems = function(items){
      for(var i=0; i<items.length;i++)
        if(items[i].items.length > 0)
          return true;

      return false;
    }

	var viewport = angular.element($window);
	viewport.bind('resize', function(){
		if(Object.keys(c.data.footer).length)
			applyMasonryOnLoad();
	});

	if(Object.keys(c.data.footer).length)
		init();

    $scope.portalFooterLoaded = function() {
        var payload = {};
        payload.name = "Portal Footer loaded";
        payload.data = {};
        snAnalytics.addEvent(payload);
    };
    $scope.portalFooterClicked = function(e, type) {
        var payload = {};
        payload.name = "Portal Footer clicked";
        payload.data = {'element_clicked': type};
        snAnalytics.addEvent(payload);
    };

    c.evaluateFooterVisibility = function () {
      var params = $location.search();
      $scope.showFooter = (params && params.id && params.id == "nowassistselfservice") ? false : true;
    };
    
    $scope.$on('sp_loading_indicator', function(e, value) {
      $scope.loadingIndicator = value;
      // Evaluate footer visibility once the page has completed loading.
      if(!value)
        c.evaluateFooterVisibility();
    });
};
