function escHeaderController($rootScope, $scope, $window, spUtil, $location, $uibModal, cabrillo, $timeout, i18n,spContextManager) {
	var c = this;
	
	c.evaluateSearchWidgetVisibility = function() {
		var currentUrl = $location.url();
		var isChanged = false;
		if (c.data.hideSearchOnHomepage) {
			// hide on home page
			if(currentUrl.endsWith(c.data.dashboardSuffix) || currentUrl.endsWith(c.data.portalSuffix)) {
				$scope.showSearchBar = false;
				isChanged = true;
			}
			else
				$scope.showSearchBar = true;	
		}
    
		if(currentUrl.indexOf("id=lf") !== -1 || isChanged)
		    $scope.showSearchBar = false;
		else
		    $scope.showSearchBar = true;
	}
	
	$scope.showSearchBar = true;
	$scope.userID = $scope.user.sys_id;
	$scope.todosPopupId = c.data.isMobile?'#popup_todos_mobile':'';
	$scope.casesPopupId = c.data.isMobile?'#popup_cases_mobile':'';
	$scope.popupType = c.data.isMobile?'collapse':'dropdown';
	$scope.expanded = false;
	$scope.cartItemCount = 0;
	$scope.isVAActive = c.data.isVAActive;
	
	c.todoCountTranslation = i18n.format(c.data.todoCountLabel, String(c.data.todoCount));

	var MOBILE_DEVICE_SCREEN_WIDTH = 767;
	$scope.mobileDevice = c.data.isMobile || ($window.innerWidth < MOBILE_DEVICE_SCREEN_WIDTH);
	$scope.showChat = false;
	if (!$scope.showChat)
		$('div.sp-ac-container').hide();
	$scope.toggleChat = function() {
		var alreadyIntegratedChat = $('div.conversation-button-container').length > 0;
		spContextManager.getContextForKey('agent-chat', true).then(function(context) {
			context = context || {};
			context.show_ask_a_question_prechat = false;
			spContextManager.updateContextForKey('agent-chat', context);
		});
		$('a#va_chat').toggleClass(' active-chat');
		var isOpen = $('button.sp-ac-btn.open').length !=0;
		var isVisible = $('button.sp-ac-btn.closed').is(":visible");
		$scope.showChat = (isVisible)? isVisible : !$scope.showChat;
		if(alreadyIntegratedChat){
			$scope.$$postDigest(function(){
				$('div.conversation-button-container button.help-button').trigger('click');
			});
		} else if($scope.showChat){
			$('div.sp-ac-container').show();
			if (!isOpen) {
			$scope.$$postDigest(function(){
				$('button.sp-ac-btn').trigger('click');
			});
			}
		} else {
			$('div.sp-ac-container').hide();
			if (isOpen) {
			$scope.$$postDigest(function(){
				$('button.sp-ac-btn').trigger('click');
			});
			}
		}
	};

	if (cabrillo.isNative())
		$scope.isViewNative = true;
	

	$scope.$on("$sp.service_catalog.cart.count", function($evt, count) {
		$scope.cartItemCount = count;
	});

	$scope.$on("$locationChangeSuccess", function(event, data){
		if(c.data.isMobile){
			if($('div#popup_todos_mobile').is(":visible"))
				$('li > a#todos_popup').click();
			else if($('div#popup_cases_mobile').is(":visible"))
				$('li > a#cases_popup').click();
		} else {
			$('li.open > a#cases_popup').click();
			$('li.open > a#todos_popup').click();	
		}
		c.evaluateSearchWidgetVisibility();
	});

	$scope.$on('sp_loading_indicator', function(e, value) {
		$scope.loadingIndicator = value;
	});

	c.processWatchers = function(watcher){
		setTimeout($scope.reloadHeader,20);
	};

	/* Record Watchers */ 
	if (c.data.recordWatchers && c.data.recordWatchers.length > 0) {
		angular.forEach(c.data.recordWatchers, function(watcher) {
			spUtil.recordWatch($scope, watcher.table, watcher.filter, c.processWatchers);
		});
	}

	$scope.reloadHeader = function(actionName) {
		c.data.action = actionName || c.data.ACTION_TODO_COUNT;
		if(c.data.action== c.data.ACTION_TODO_COUNT)
			c.server.get({action:c.data.action}).then(function(resp){
				c.data.todoCount = resp.data.todoCount;
				c.todoCountTranslation = i18n.format(c.data.todoCountLabel, String(c.data.todoCount));
			});
		else
			c.server.update();	
	};

	$scope.openLogin = function () {
		$scope.modalInstance = $uibModal.open({
			templateUrl: 'modalLogin',
			scope: $scope
		});
	};

	$rootScope.$on("update.searchpage", function(e, searchPage){
		$scope.searchPage = searchPage;
	});

	$rootScope.$on('sp.avatar_changed', function() {
		$scope.userID = ""; 
		$timeout(function(){
			$scope.userID = $scope.user.sys_id;
		});
	});

	$scope.isHomepage = function() {
		if (!$scope.page.id)
			return true;

		if ($scope.page.id == $scope.portal.homepage_dv)
			return true;

		return false;
	};

	$(document).ready(function() {
		$scope.reloadHeader();
	});
	
	c.evaluateSearchWidgetVisibility();

	//remove nested ul to fix screen reader issue
	$timeout(function () {
		var cartToursWrapper = $('.navbar-header .v'+ scope.data.top.menu.sys_id);
		
		if (!cartToursWrapper.length)
			return;
		
		var menu = cartToursWrapper.parent().parent();
		var menuItems = cartToursWrapper.children();
		menu.append(menuItems);
		cartToursWrapper.parent().remove();
	}, 1000);
}
