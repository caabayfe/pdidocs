function($rootScope, $scope, spScUtil) {
    /* widget controller */
    var c = this;

    spScUtil.getPreference('catalog-item-list-view', function(value) {
        $scope.view = value || 'card';
    });

    $scope.getItemHREF = function(item) {
        if ($scope.options.legacy_catalog && item.legacy)
            return getLegacyUrl(item)
        else
            return '?id=' + item.page + '&sys_id=' + item.sys_id;
    }

    $scope.handleItemClick = function(item, $event) {
        window.GlideWebAnalytics.trackEvent("Service Catalog", "Popular Items", "Item Clicked: " + (item.name || item.sys_id));
        if ($scope.options.legacy_catalog && item.legacy) {
            var url = getLegacyUrl(item);
            window.open(url, '_blank');
            $event.preventDefault();
        }
    };

    CustomEvent.on("item.listview.changed", (view) => {
        $scope.view = view;
    })

    function getLegacyUrl(item) {
        var url = null;
        var parentTable = null;
        var parentSysId = null;
        if ($window.frameElement) {
            parentTable = $window.frameElement.dataParentTable;
            parentSysId = $window.frameElement.dataParentSysId;
        }
        if (item.type == 'order_guide')
            url = '/cat_item_guide_view.do?sysparm_guide=' + item.sys_id;
        else
            url = '/cat_item_view.do?sysparm_id=' + item.sys_id;
        if (parentTable && parentSysId) {
            url = url + '&sysparm_parent_sys_id=' + parentSysId + '&sysparm_parent_table=' + parentTable
        }
        return url;
    }
}
