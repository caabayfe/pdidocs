api.controller = function($scope, $location, $timeout, $window, $element, spUtil, spAriaUtil) {
  var c = this;

  $scope.isReportLoading = false;
  c.directReports = c.data.directReports;
  c.hasMoreReport = c.data.hasMoreReport;
  var selectedUser = c.data.selectedUser || {};
  // Set user record picker field
  c.user = {
    displayValue: selectedUser.title || '',
    value: selectedUser.sys_id || '',
    name: 'user'
  };

  // user changed
  $scope.$on("field.change", function(evt, parms) {
    if (parms.field.name != 'user')
      return;
    c.selectNewUser(parms.field.value);
  });

  //Select a node and update the view
  c.selectNewUser = function(userId) {
    if (!userId) return;

    // Update the URL
    var s = $location.search();
    s['sys_id'] = userId;
    $location.search(s);
  }

  c.showMoreDirectReports = function() {
    spAriaUtil.sendLiveMessage(c.data.i18n.loadDirectReports);
    $scope.isReportLoading = true;
    return $scope.server.get({
      "action": "moreReport",
      "userId":c.data.userId,
      "offset": c.directReports.length
    }).then(function(response) {
      c.directReports = response.data.directReports || c.directReports || [];
      c.hasMoreReport = response.data.hasMoreReport || false;
      $scope.isReportLoading = false;
    });
  };

  c.handleEnterKeyPress = function(event, userId, type) {
    if (event.keyCode === 13 || event.keyCode === 32) {
      event.preventDefault();
      event.stopPropagation();

      switch (type) {
        case "profile":
          c.openProfile(event, userId);
          break;

        case "new":
          c.selectNewUser(userId);
          break;

        case "report":
          var focusIndex = c.directReports.length;

          c.showMoreDirectReports().then(function() {
            $timeout(function() {
            var cards = $element[0].querySelectorAll('#directReportContainer .secondary-card-container');
		  	if (cards[focusIndex])
			  cards[focusIndex].focus();
            }, 100);
          });
          break;

        default:
          break;
      }
    }
  }

  c.openProfile = function(event, userId) {
    // Stop event propagation to prevent triggering the parent node click
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    $window.open(spUtil.format(c.options.profile_url, { sys_id: userId}));
  }
};
