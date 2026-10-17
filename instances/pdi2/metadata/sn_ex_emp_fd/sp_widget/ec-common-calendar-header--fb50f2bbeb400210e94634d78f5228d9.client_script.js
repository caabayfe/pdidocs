function($scope, $rootScope, $sce, $sanitize, $window, $document, i18n) {
	/* widget controller */
	var c = this;
	var TAB_KEY = "9";
	$scope.userDateFormat = g_user_date_format.toUpperCase();
	
	c.SMALL_FORM_FACTOR_WIDTH_LIMIT = 761;
	c.isSmallFormFactor = $window.innerWidth < c.SMALL_FORM_FACTOR_WIDTH_LIMIT;
	if ($scope.data.schedulerConfig && $scope.data.schedulerConfig.mode)
		$scope.viewScale = $scope.data.schedulerConfig.mode;
	else
		$scope.viewScale = 'week';

	$scope.prevButton = function () {
		$rootScope.$broadcast('previousDate');
	};
	$scope.nextButton = function () {
		$rootScope.$broadcast('nextDate');
	};
	$scope.todayButton = function () {
		$rootScope.$broadcast('today');
	};
	$scope.showMiniCal = function () {
		$rootScope.$broadcast('showMiniCal');
	};

	$scope.headerContent = "";
	
	c.navTooltips = {
		right: c.data.messages.NEXT,
		left: c.data.messages.PREV
	};
	$scope.renderTooltip = function () {
		if ($scope.viewScale === 'day') {
			c.navTooltips.right = c.data.messages.NEXT_DAY;
			c.navTooltips.left = c.data.messages.PREV_DAY;
		}
		else if ($scope.viewScale === 'week') {
			c.navTooltips.right = c.data.messages.NEXT_WEEK;
			c.navTooltips.left = c.data.messages.PREV_WEEK;
		}
		else if ($scope.viewScale === 'month') {
			c.navTooltips.right = c.data.messages.NEXT_MONTH;
			c.navTooltips.left = c.data.messages.PREV_MONTH;
		}
	}
	$scope.renderTooltip();

	var initDate = $scope.data.schedulerConfig.date ? new Date(Date.parse($scope.data.schedulerConfig.date)) : new Date();
	$scope.selectedDate = new moment(initDate).format($scope.userDateFormat);

	$scope.balanceDateField = {
		label: 'Schedule',
		name: 'ec_common_cal_header_datepicker',
		value: ''
	};

	$scope.gotoDate = function () {
		if ($scope.selectedDate)
			$rootScope.$broadcast('gotoDate', new moment($scope.selectedDate, $scope.userDateFormat).toDate());
	}

	$rootScope.$on('sn_ex.calendar_resize', function(e, isSmallFormFactorObj) {
		c.isSmallFormFactor = isSmallFormFactorObj.isSmallFormFactor;
	});

	$(document).on('keydown', '.dhx_focus_slot, .dhx_cal_event, .dhx_cal_event_line, .dhx_cal_event_clear, .cal_event, .dhx_month_head a', function(event) {
		if (event.which == TAB_KEY && event.shiftKey) {
			var headerButtonList = $('.ec-common-calendar-header').find('button');
			if (headerButtonList.length > 0)
				headerButtonList.eq(headerButtonList.length-1).focus();
			event.preventDefault();
		}
	});
}
