api.controller = function($scope, $location, $timeout, $element, $window, spUtil, spModal) {
    var c = this;
    c.show_more_count = parseInt(c.options.show_more_count);
    $scope.numberOfReporteeDisplayed = c.data.limitTo;
    $scope.numberOfReporteeLeftToDisplay = c.show_more_count;
    $scope.numberOfCoworkersDisplayed = c.data.limitTo;
    $scope.numberOfCoworkersLeftToDisplay = c.show_more_count;

    $scope.numberOfDottedReportsDisplayed = c.data.limitTo;
    $scope.numberOfDottedReportsLeftToDisplay = c.show_more_count;

    $scope.numberOfDottedManagersDisplayed = c.data.limitTo;
    $scope.numberOfDottedManagersLeftToDisplay = c.show_more_count;

    $scope.ispopoverToggled = false;
    $scope.initialFocusElement = undefined;
    $scope.tabCounter = 0;

    $scope.showFullInfoCollegues = false;
    $scope.showFullInfoReports = false;
    $scope.showFullInfoDottedManagers = false;
    $scope.showFullInfoDottedReports = false;
    $scope.showMyProfile = false;

    $scope.myManager = c.data.teamData.manager;
    $scope.teamMembers = c.data.teamData.members;
    $scope.dottedManagers = c.data.teamData.dotted_managers;
    $scope.directReports = c.data.teamData.direct_reports;
    $scope.dottedReports = c.data.teamData.dotted_reports;

    $scope.showManagersSection = true;
    $scope.showReportsSection = false;
    $scope.showCoworkersSection = false;

    if (c.data.teamData.user && c.data.teamData.user.sys_id) { //if user exists, then this isn't 'my' profile. It's someone elses.
        $scope.showMyProfile = true;
        $scope.userID = c.data.teamData.user.sys_id;
    }

    $scope.numberOfDottedManagersLeftToDisplay = $scope.dottedManagers.length - c.data.limitTo;
    $scope.numberOfReporteeLeftToDisplay = $scope.directReports.length - c.data.limitTo;
    $scope.numberOfDottedReportsLeftToDisplay = $scope.dottedReports.length - c.data.limitTo;
    $scope.numberOfCoworkersLeftToDisplay = $scope.teamMembers.length - c.data.limitTo;

    $scope.managersCount = $scope.myManager ? $scope.dottedManagers.length + 1 : $scope.dottedManagers.length;

    $scope.isMobile = function() {
        return (window.innerWidth <= 767);
    };

    var adjustPopOver = function() {
        var popovers = document.getElementsByClassName('popover active');
        for (var i = 0; i < popovers.length; i++) {
            var popoverEle = popovers[i];
            if (window.innerWidth > 440) {
                var popOverWidth = 420;
                var panelWidth = document.getElementById('my-team-panel').offsetWidth;
                popoverEle.style.left = panelWidth - popOverWidth - 20 + 'px';
                popoverEle.style.width = 420 + 'px';
            } else {
                popoverEle.style.width = (window.innerWidth - 20) + 'px';
                popoverEle.style.left = 10 + 'px';
            }
        }
    };

    var resizeWindow = function() {
        adjustPopOver();
    };

    var appWindow = angular.element($window);
    appWindow.bind('resize', _.debounce(resizeWindow, 500));

    $(document).keydown(function(e) {
        if (e.key === 'Escape') { // escape key maps to keycode `27`
            var popovers = document.getElementsByClassName('popover active');
            for (var i = 0; i < popovers.length; i++) {
                $scope.closepopover(popovers[i].id);
            }
            $scope.ispopoverToggled = false;
        } else if ($('.popover.active')[0] && e.keyCode === 9 && e.shiftKey) { // keyCode 9 maps to `Tab` button and e.shiftKey means shift button is active
            if ($scope.tabCounter === 0) {
                e.preventDefault();
                $('.popover.active').find('.view-org-chart')[0].focus();
            }
            if (document.activeElement === $('.popover.active').find('.close-button')[0]) {
                e.preventDefault();
                $('.popover.active').find('.view-org-chart')[0].focus();
                $scope.tabCounter = 0;
            }
            $scope.tabCounter++;
        }
        //Enters only when document has any active popover
        else if ($('.popover.active')[0] && e.keyCode === 9) { // keyCode 9 maps to `Tab` button 
            if ($scope.tabCounter === 0) {
                e.preventDefault();
                $('.popover.active').find('.close-button')[0].focus();
                $scope.tabCounter = 0;
            }
            if (document.activeElement === $('.popover.active').find('.view-org-chart')[0]) {
                e.preventDefault();
                $('.popover.active').find('.close-button')[0].focus();
                $scope.tabCounter = 0;
            }
            $scope.tabCounter++;
        }
    });

    $scope.closepopovers = function() {
        var popovers = document.getElementsByClassName('popover');
        for (var i = 0; i < popovers.length; i++) {
            $scope.closepopover(popovers[i].id);
        }
    }
    $scope.closepopover = function(popover) {
        $('#' + popover).removeClass('active');
        document.removeEventListener('click', popoverClickHandler);
        $scope.initialFocusElement = undefined;
        $scope.tabCounter = 0;
    };

    var popoverClickHandler = function(event) {
        if (('show-more-button' == event.target.className || 'fa fa-ellipsis-h' == event.target.className) && !$scope.ispopoverToggled) {
            $scope.ispopoverToggled = true;
            return;
        }
        if ($('.popover.active')[0] && !$('.popover.active')[0].contains(event.target)) {
            $('.popover').removeClass('active');
            $scope.initialFocusElement = undefined;
            $scope.ispopoverToggled = false;
            $scope.tabCounter = 0;
            document.removeEventListener('click', popoverClickHandler);
        }
    }

    $scope.showMoreinfo = function(user) {
        var popovers = document.getElementsByClassName('popover');
        var sys_id = user.sys_id.toString();
        var popoverId = 'popover-' + sys_id;
        for (var i = 0; i < popovers.length; i++) {
            if (popovers[i].className.includes('active') && popovers[i].id == popoverId)
                return;
            else if (popovers[i].className.includes('active'))
                $scope.closepopover(popovers[i].id);
        }
        $scope.ispopoverToggled = false;
        var distanceTop = $('#more-' + sys_id)[0].offsetTop;

        var popoverEle = document.getElementById('popover-' + sys_id);
        var popoverHeight = $(popoverEle).height();
        var popOverWidth = 420;

        var panelWidth = document.getElementById('my-team-panel').offsetWidth;
        popoverEle.style.left = panelWidth - popOverWidth - 20 + 'px';

        popoverEle.style.width = 420 + 'px';
        if (window.innerWidth < 440) {
            popoverEle.style.width = (window.innerWidth - 20) + 'px';
            popoverEle.style.left = 10 + 'px';
        }
        distanceTop = distanceTop - popoverHeight;

        popoverEle.style.top = distanceTop + 'px';

        $('#popover-' + sys_id).addClass('active');

        document.addEventListener('click', popoverClickHandler);
    };

    $scope.showTeamWidget = function() {
        return ($scope.myManager && $scope.myManager.sys_id) ||
            ($scope.teamMembers && $scope.teamMembers.length > 0) ||
            ($scope.directReports && $scope.directReports.length > 0) ||
            ($scope.dottedManagers && $scope.dottedManagers.length > 0) ||
            ($scope.dottedReports && $scope.dottedReports.length > 0);
    };

    $scope.updateList = function(variable, value) {
        var nextFocusableMember = 0;
        if (variable == 'dotted_managers') {
            if ($scope.numberOfDottedManagersLeftToDisplay < c.show_more_count || !value) {
                nextFocusableMember = $scope.numberOfDottedManagersDisplayed;
                $scope.showFullInfoDottedManagers = value;
                $scope.numberOfDottedManagersDisplayed = c.data.limitTo;
                $scope.numberOfDottedManagersLeftToDisplay = $scope.dottedManagers.length - c.data.limitTo;
            } else {
                nextFocusableMember = $scope.numberOfDottedManagersDisplayed;
                $scope.numberOfDottedManagersDisplayed = $scope.numberOfDottedManagersDisplayed + ($scope.numberOfDottedManagersLeftToDisplay < c.show_more_count ? $scope.numberOfDottedManagersLeftToDisplay : c.show_more_count);
                $scope.numberOfDottedManagersLeftToDisplay = $scope.dottedManagers.length - $scope.numberOfDottedManagersDisplayed;
            }
        } else if (variable == 'direct_reports') {
            if ($scope.numberOfReporteeLeftToDisplay < c.show_more_count || !value) {
                nextFocusableMember = $scope.numberOfReporteeDisplayed;
                $scope.showFullInfoReports = value;
                $scope.numberOfReporteeDisplayed = c.data.limitTo;
                $scope.numberOfReporteeLeftToDisplay = $scope.directReports.length - c.data.limitTo;
            } else {
                nextFocusableMember = $scope.numberOfReporteeDisplayed;
                $scope.numberOfReporteeDisplayed = $scope.numberOfReporteeDisplayed + ($scope.numberOfReporteeLeftToDisplay < c.show_more_count ? $scope.numberOfReporteeLeftToDisplay : c.show_more_count);
                $scope.numberOfReporteeLeftToDisplay = $scope.directReports.length - $scope.numberOfReporteeDisplayed;
            }
        } else if (variable == 'dotted_reports') {
            if ($scope.numberOfDottedReportsLeftToDisplay < c.show_more_count || !value) {
                nextFocusableMember = $scope.numberOfDottedReportsDisplayed;
                $scope.showFullInfoDottedReports = value;
                $scope.numberOfDottedReportsDisplayed = c.data.limitTo;
                $scope.numberOfDottedReportsLeftToDisplay = $scope.dottedReports.length - c.data.limitTo;
            } else {
                nextFocusableMember = $scope.numberOfDottedReportsDisplayed;
                $scope.numberOfDottedReportsDisplayed = $scope.numberOfDottedReportsDisplayed + ($scope.numberOfDottedReportsLeftToDisplay < c.show_more_count ? $scope.numberOfDottedReportsLeftToDisplay : c.show_more_count);
                $scope.numberOfDottedReportsLeftToDisplay = $scope.dottedReports.length - $scope.numberOfDottedReportsDisplayed;
            }
        } else if (variable == 'colleagues') {
            if ($scope.numberOfCoworkersLeftToDisplay < c.show_more_count || !value) {
                nextFocusableMember = $scope.numberOfCoworkersDisplayed;
                $scope.showFullInfoCollegues = value;
                $scope.numberOfCoworkersDisplayed = c.data.limitTo;
                $scope.numberOfCoworkersLeftToDisplay = $scope.teamMembers.length - c.data.limitTo;
            } else {
                nextFocusableMember = $scope.numberOfCoworkersDisplayed;
                $scope.numberOfCoworkersDisplayed = $scope.numberOfCoworkersDisplayed + ($scope.numberOfCoworkersLeftToDisplay < c.show_more_count ? $scope.numberOfCoworkersLeftToDisplay : c.show_more_count);
                $scope.numberOfCoworkersLeftToDisplay = $scope.teamMembers.length - $scope.numberOfCoworkersDisplayed;
            }
        }
        $scope.focusOnNextMember(value, variable, nextFocusableMember);
    };

    $scope.focusOnNextMember = function(value, category, count) {
        $timeout(function() {
            var categoryId = '#' + category;
            if (value)
                $element.find(categoryId + ' [tabindex=0]')[count].focus();
            else
                $element.find(categoryId + ' .more_link').focus();
        });
    };

    $scope.toggleManagersSection = function() {
        $scope.showManagersSection = !$scope.showManagersSection;
    };

    $scope.toggleReportsSection = function() {
        $scope.showReportsSection = !$scope.showReportsSection;
    };

    $scope.toggleCoworkersSection = function() {
        $scope.showCoworkersSection = !$scope.showCoworkersSection;
    };

};
