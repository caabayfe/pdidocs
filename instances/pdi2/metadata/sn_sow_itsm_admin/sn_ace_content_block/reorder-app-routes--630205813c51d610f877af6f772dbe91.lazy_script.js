(function(context, pageParams, blockcontext) {
    var previousRecordInList = blockcontext.previousRecordInList;
    var nextRecordInList = blockcontext.nextRecordInList;
    var previousRecordOrderInList = null;
    var nextRecordOrderInList = null;

    // Query for the order of the row before the moved row
    if (previousRecordInList) {
        var prevAppRouteGR = new GlideRecord('sys_ux_app_route');
        if (prevAppRouteGR.get(previousRecordInList)) {
            previousRecordOrderInList = prevAppRouteGR.order;
        }
    }

    // Query for the order of the row after the moved row
    if (nextRecordInList) {
        var nextAppRouteGR = new GlideRecord('sys_ux_app_route');
        if (nextAppRouteGR.get(nextRecordInList)) {
            nextRecordOrderInList = nextAppRouteGR.order;
        }
    }

    // Calculate the new order for the moved row
    var newOrder;
    if (previousRecordOrderInList !== null && nextRecordOrderInList !== null) {
        newOrder = (previousRecordOrderInList + nextRecordOrderInList) / 2;
    } else if (previousRecordOrderInList !== null) {
        newOrder = previousRecordOrderInList + 100; // Set a new order greater than the previous row
    } else if (nextRecordOrderInList !== null) {
        newOrder = nextRecordOrderInList - 100; // Set a new order less than the next row
    } else {
        newOrder = 100; // Default order value if both are null
    }

    // Update the moved row with the new order
    var movedAppRouteGR = new GlideRecord('sys_ux_app_route');
    if (movedAppRouteGR.get(blockcontext.movedRowSysId)) {
        movedAppRouteGR.order = newOrder;
        movedAppRouteGR.update();
    }

})(context, pageParams, blockcontext);
