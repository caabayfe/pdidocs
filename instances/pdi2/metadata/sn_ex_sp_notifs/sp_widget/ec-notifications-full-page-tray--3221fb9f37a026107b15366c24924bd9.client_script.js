api.controller = function (spUtil) {
    /* widget controller */
    var c = this;
    spUtil.get("ec-notifications-tray", {
        ...c.data.trayWidgetOptions
    }).then(function (response) {
        c.data.notificationsTrayWidget = response;
    });
};
