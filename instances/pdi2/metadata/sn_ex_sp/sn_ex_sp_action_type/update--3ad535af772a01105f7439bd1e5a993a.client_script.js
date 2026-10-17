if (isEsignatureEnabled == "false") {
    $rootScope.$broadcast('todoActionEvent', null);
    var payload = {};
    payload.name = "SC_APPROVER_ACTION";
    payload.data = {};
    payload.data["isEscPortal"] = $scope.data.portalSysId === '70cd9f3b734b13001fdae9c54cf6a72f';
    payload.data["portalSuffix"] = $scope.data.portalSuffix;
    payload.data["Number"] = number;
    payload.data["Action"] = action;
    snAnalytics.addEvent(payload);
}
