function pspHeaderController($rootScope, $scope, $window, spUtil, $location, $uibModal, cabrillo, $timeout, i18n, spContextManager,spAriaUtil) {
    var c = this;
	var userOptionsMessage=i18n.getMessage('User options: {userName}');
	c.userLabel = userOptionsMessage.replace('{userName}',$scope.user.name);
    $scope.avatarProfile = {
		userID: $scope.user.sys_id,
		name: $scope.user.name,
		initials: $window.NOW.user_initials
	  };
	  if ($window.NOW.user_avatar) {
		$scope.avatarProfile.userImage = $window.NOW.user_avatar;
	  }
    // Events fired from/to $rootScope for responsive mobile view.
    c.SHOW_MOBILE_MEGA_MENU = 'showMobileMegaMenu';
    c.SHOW_MOBILE_MENU_ON_DESKTOP = 'showMobileMenuOnDesktop';
    c.TOGGLE_MOBILE_MENU_VISIBILITY = 'toggleMobileMenuVisibility';

    $scope.showSearchBar = true;
    $scope.userID = $scope.user.sys_id;
    $scope.popupType = c.data.isMobile ? 'collapse' : 'dropdown';
    $scope.expanded = false;
    $scope.isMobileViewOnDesktopExpanded = false;
	var flag = 0;
    // $scope.loadingIndicator = $rootScope.loadingIndicator;

    /* Below 2 scope variables (showMobileMenuOnDesktop, showMobileMegaMenu) have counterparts in EC Navigation widget also.
     So whenever we set these variables, make sure to emit an event on rootScope to update them in the former widget as well. */

    // Determines whether to show mobile view on desktop due to oveflow of items in sub navigation bar of header.
    $scope.showMobileMenuOnDesktop = false;
    // Used to hide global navigation tools on mobile while showing mega menu topics in right panel.
    $scope.showMobileMegaMenu = false;

    c.MOBILE_DEVICE_SCREEN_WIDTH = 767;
    var spPageRoot = document.querySelector(".sp-page-root");
    $scope.mobileDevice = c.data.isMobile || (spPageRoot.clientWidth <= c.MOBILE_DEVICE_SCREEN_WIDTH);

    function resizeObserver() {
      var spPageRoot = document.querySelector(".sp-page-root");
      if(window.ResizeObserver) {
        var resizeObserver = new ResizeObserver((entries) => {
          if (entries) {
            $scope.mobileDevice = c.data.isMobile || (spPageRoot.clientWidth <= c.MOBILE_DEVICE_SCREEN_WIDTH);
          }
        });

        if (spPageRoot) {
          resizeObserver.observe(spPageRoot);
        }
      }
    }

    resizeObserver();


    if (cabrillo.isNative())
        $scope.isViewNative = true;

    $scope.isCategorySelectedOnMobileMegaMenu = false;
    $rootScope.$on('categorySelectedOnMobileMegaMenu', function(event, isCategorySelected) {
        $scope.isCategorySelectedOnMobileMegaMenu = isCategorySelected;
    });
    $scope.newPageId = c.data.initialPageId;
    $scope.showSearchbarOnMobile = false;
    
    c.getContainer = function(){
		  return $("." + "instance" + "-" + c.data.instanceId);
	  };

    $scope.showSearchBarMobile = function(event) {
		if (event.keyCode === 13 || event.keyCode === 32) {
			event.preventDefault();
		}
      $scope.showSearchbarOnMobile = true;
      $timeout(function() {
        $scope.focusOnSearchBar();
      });
    };

   	$scope.hideSearchBarMobile = function() {
        $scope.showSearchbarOnMobile = false;
		$timeout(function(){
			 $scope.$apply();
		},10);    
    };


    document.addEventListener('focus', (event) => {
	var  currentlyFocusedElement = event.target;
	if(flag ==1)
	{
		if(currentlyFocusedElement.name!= 'search' &&  currentlyFocusedElement!=c.getContainer().find('input[name="q"]')[0] && currentlyFocusedElement!=c.getContainer().find('sn-search-combobox')[0]){
			var typeaheadSearchDiv = c.getContainer().find('#searchBox');
			typeaheadSearchDiv.removeClass("show-search").addClass('hide-search');
			$timeout(function() {
				// visibility should be hidden after the collapsing animation, hence the timeout
				typeaheadSearchDiv.addClass('visibility-collapse');
				c.getContainer().find('#searchbox-icon').removeClass('hidden');
			}, 500);
			if($scope.mobileDevice)
				$scope.hideSearchBarMobile();
			flag =0;
		}
	}
    }, true);

    $scope.focusOnSearchBar = function() {
		flag=1;
      // focus on the search widget input box, and add a blur event
      if (c.data.aisEnabled) {
        var searchBox = c.getContainer().find('sn-search-combobox')[0];
		if ($scope.mobileDevice)
        searchBox.addEventListener('blur', $scope.onSearchBoxBlur);
        $timeout(function() {
          searchBox.shadowRoot.childNodes[0].shadowRoot.childNodes[0].querySelector('input').focus();
        }, 500);
      } else {
        var searchBox = c.getContainer().find('input[name="q"]')[0];
		searchBox.addEventListener('keydown',(event)=>$scope.onSearchBoxTab(event));
        searchBox.focus();
      }
    };
	
		$scope.onSearchBoxTab = function(event){
			$timeout(function() {
				if(event.keyCode==9){
            var searchIcon =  c.getContainer().find('#searchbox-icon');
						searchIcon.focus();
				}        
        }, 525);
		
		};

    $scope.showAndExpandSearch = function(event) {
      // show typeahead search widget and hide search icon on Desktop view
			spAriaUtil.sendLiveMessage(i18n.getMessage("button expanded"));
      c.getContainer().find('#searchBox').removeClass('hide-search').addClass('show-search').removeClass('visibility-collapse');
	    c.getContainer().find('#searchbox-icon').addClass('hidden');
      $scope.focusOnSearchBar();
    };

    $scope.onSearchBoxBlur = function(event) {
     	$scope.hideSearchBarMobile();
    };

    $scope.getUrlParameters = function(parameter, decode, staticURL) {
      var url = staticURL ? staticURL : $location.url();
      var currLocation = (url.length) ? url : window.location.search;
      if (!currLocation || !currLocation.split("?") || currLocation.split("?").length < 2)
        return '';
      var paramArr = currLocation.split("?")[1].split("&");
      var numOfParams = paramArr.length;
      for (var i = 0; i < numOfParams; i++) {
        param = paramArr[i].split("=");
        if (param[0] === parameter)
          return (decode) ? decodeURIComponent(param[1]) : param[1];
      }
      return '';
    };

    $scope.$on("$sp.service_catalog.cart.count", function($evt, count) {
        $scope.cartItemCount = count;
    });

    $scope.$on("$locationChangeSuccess", function(event, data) {
      $scope.newPageId = $scope.getUrlParameters("id", true, data);
        if (c.data.isMobile) {
            if ($('div#popup_todos_mobile').is(":visible"))
                $('li > a#todos_popup').click();
            else if ($('div#popup_cases_mobile').is(":visible"))
                $('li > a#cases_popup').click();
        } else {
            $('li.open > a#cases_popup').click();
            $('li.open > a#todos_popup').click();
        }

      // hide modal-div on location change
      if($scope.isMobileViewOnDesktopExpanded){
        $scope.isMobileViewOnDesktopExpanded = false;
        $scope.expanded = false;
        $scope.showMobileMegaMenu = false;
        $rootScope.$emit(c.SHOW_MOBILE_MEGA_MENU, false);
      }
    });

    $scope.openLogin = function() {
        $scope.modalInstance = $uibModal.open({
            templateUrl: 'spPolarisModalLogin',
            scope: $scope
        });

        var pageRoot = angular.element('.sp-page-root');
        $scope.modalInstance.rendered.then(function() {
            var $uibModalStack = $injector.get('$uibModalStack');
            var modalObj = $uibModalStack.getTop();
            var modal = modalObj.value.modalDomEl;

            modal.attr('aria-label', modal.find('.panel-title').html());
            modal.attr('aria-modal', 'true');
            pageRoot.attr('aria-hidden', 'true');
        });

        $scope.modalInstance.closed.then(function() {
            pageRoot.attr('aria-hidden', 'false');
        });
    };

    $rootScope.$on("update.searchpage", function(e, searchPage) {
        $scope.searchPage = searchPage;
    });

    $rootScope.$on('sp.avatar_changed', function() {
        $scope.userID = '';
        $timeout(function() {
            $scope.userID = $scope.user.sys_id;
        });
    });

    $rootScope.$on(c.SHOW_MOBILE_MENU_ON_DESKTOP, function(event, showMobileMenuOnDesktop) {
        if (!showMobileMenuOnDesktop && $scope.showMobileMenuOnDesktop) {
            $scope.isMobileViewOnDesktopExpanded = false;
        }
        $scope.showMobileMenuOnDesktop = showMobileMenuOnDesktop;
    });

    $rootScope.$on(c.SHOW_MOBILE_MEGA_MENU, function(event, showMobileMegaMenu) {
        $scope.showMobileMegaMenu = showMobileMegaMenu;
    });

    $scope.toggleMobileMenuVisibility = function(event) {
        if (event) {
            event.stopPropagation();
        }
        $scope.isMobileViewOnDesktopExpanded = !$scope.isMobileViewOnDesktopExpanded;
        $scope.expanded = false;
        $scope.showMobileMegaMenu = false;
        $rootScope.$emit(c.SHOW_MOBILE_MEGA_MENU, false);
    };

    $rootScope.$on(c.TOGGLE_MOBILE_MENU_VISIBILITY, function() {
        $scope.toggleMobileMenuVisibility();
    });

    $scope.isHomepage = function() {
        if (!$scope.page.id)
            return true;

        if ($scope.page.id == $scope.portal.homepage_dv)
            return true;

        return false;
    };

}
