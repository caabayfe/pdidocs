function(ActionParameterService, $scope, $window, $timeout, $location, spAriaUtil, cabrillo, i18n) {
    /* widget controller */
    var c = this;
    c.selectAllChecked = c.data.lines_data.defaultSelected === undefined || c.data.lines_data.defaultSelected;

    $scope.selectedLines = {};
    c.filteredLines = c.data.lines_data.lineItemsData;
	c.columns = c.data.lines_data.columns;
	c.columnMap ={};
	c.columns.forEach(function(key){
		c.columnMap[key] = c.filteredLines[0].rowData[key].label;
	});

    
    c.selectableLines = c.data.lines_data.lineItemsData.filter(function (line) {
        return c.data.lines_data.selectable && (line.selectable === undefined || line.selectable)
    });
    c.showSelectAll = !!c.selectableLines.length;
    c.filter = "all";
	c.filterRecords = {};

    if ($scope.isNative) {
        cabrillo.viewLayout.setTitle(c.data.msg.pageTitle);
        cabrillo.viewLayout.hideBackButton();
    }

    $timeout(function () {
        if ($scope.isNative)
            cabrillo.viewLayout.hideSpinner();
    });

    c.setupFilters = function () {
        var lines = c.data.lines_data;
        // Setup filters
        if (lines && lines.filterConfig) {
            // Generate filtered lists for quick retrieval
            lines.filterConfig.values.forEach(function (filterObj) {
                c.filterRecords[filterObj.value] = lines.lineItemsData.filter(function (l) {
                    return l.rowData[lines.filterConfig.column].value == filterObj.value;
                });
            });

            c.filterValues = [{
                label: i18n.getMessage("All"),
                value: "all"
            }].concat(lines.filterConfig.values.map(function (filter) {
                return {
                    label: filter.label + ' (' + c.filterRecords[filter.value].length + ')',
                    value: filter.value
                }
            }));
			
            c.filterOptions = lines.filterConfig.options || {
                hideSearch: true
            }
        }
    }

    $scope.selectAll = function () {
        $scope.selectedLines = {};
        c.filteredLines.forEach(function (line) {
            if (line.selectable==undefined || line.selectable)
                $scope.selectedLines[line.sys_id] = c.selectAllChecked;
        })
        c.refreshSelections();
    }

    c.refreshSelections = function () {
        var lines = Object.keys($scope.selectedLines);
        var selectedLines = lines.filter(function (lineId) {
            return !!$scope.selectedLines[lineId];
        });
        c.showSelectAll = !!lines.length;
        // Fire event with all line Ids
        ActionParameterService.broadcast('lineIds', c.selectAllChecked ? selectedLines : []);
    }


    $scope.selectLine = function () {
        var selectedList = Object.keys($scope.selectedLines).filter(function (lineId) {
            return !!$scope.selectedLines[lineId];
        });
        c.selectAllChecked = c.data.lines_data && selectedList.length == c.selectableLines.length;
        document.getElementById('select-all').indeterminate = selectedList.length>0 && !c.selectAllChecked;
        //Fire event with selected LineIds
        ActionParameterService.broadcast('lineIds', selectedList);
    }

    $scope.onFilterChange = function (filter) {
        var lineData = c.data.lines_data;
        c.filteredLines = filter === "all" ? lineData.lineItemsData : c.filterRecords[filter];
        $scope.selectAll();
        c.selectAllChecked = c.filteredLines.every(function (line) {
            return !line.selectable || $scope.selectedLines[line.sys_id]
        });
    }

    if (c.data.lines_data.filterConfig) {
        c.setupFilters();
    }
	if(c.data.lines_data.selectable && c.selectAllChecked)
        $scope.selectAll();

}
