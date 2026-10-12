api.controller = function($scope, $window) {
    /* widget controller */
    var c = this;
    c.isRequestFromPerfList = c.data.input.isRequestFromPerfList;
    c.showAjaxObjSummary = c.isRequestFromPerfList && c.data.input.showAjaxObjSummary;
    if (c.showAjaxObjSummary)
        fetchAjaxComponentData(c.data.input.slowObj);
    else
        fetchComponentsData(c.data.input.slowObj);


    $scope.$watch("c.data.input", function() {
        var inputObj = c.data.input.slowObj;
        c.isRequestFromPerfList = c.data.input.isRequestFromPerfList;
        c.showAjaxObjSummary = c.isRequestFromPerfList && c.data.input.showAjaxObjSummary;
        if (c.showAjaxObjSummary)
            fetchAjaxComponentData(inputObj);
        else
            fetchComponentsData(inputObj);
    });

    function fetchAjaxComponentData(ajaxObj) {
        $scope.selectedTab = null;
        c.WidgetObj = {
            tPage: ajaxObj.tPage,
            processingTime: ajaxObj["processing time"],
            acls: ajaxObj.acls,
            dbCalls: ajaxObj.dbCalls,
            businessRules: ajaxObj.businessRules,
            errors: ajaxObj.errors
        }
        $scope.slowObj = c.WidgetObj;
        setDefaultTab($scope.slowObj);
    }

    $scope.setTab = function(tab) {
        $scope.selectedTab = tab;
    };

    function setDefaultTab(slowObj) {
        if (!_.isEmpty(slowObj.businessRules))
            $scope.selectedTab = 1;
        else if (!_.isEmpty(slowObj.acls))
            $scope.selectedTab = 2;
        else if (!_.isEmpty(slowObj.dbCalls))
            $scope.selectedTab = 3;
        else if (!_.isEmpty(slowObj.errors))
            $scope.selectedTab = 4;
    }

    function fetchComponentsData(widgetInputObj) {
        $scope.selectedTab = null;
        c.WidgetObj = {
            widgetName: widgetInputObj.widgetName,
            widgetUrl: widgetInputObj.widgetUrl,
            clientLoadTime: widgetInputObj.clientLoadTime,
            scriptExecutionTime: widgetInputObj.scriptExecutionTime,
            acls: widgetInputObj.acls,
            dbCalls: widgetInputObj.dbCalls,
            businessRules: widgetInputObj.businessRules,
            errors: widgetInputObj.errors
        };
        $scope.slowObj = c.WidgetObj;
        setDefaultTab($scope.slowObj);
    }

};
