doInsertAndStay();

function doInsertAndStay() {
    var saveMe = current;
    insertRecord(saveMe);
    action.setRedirectURL(saveMe);
    var analyticsApi = new global.DocumentAnalyticsAPI();
    analyticsApi.sendData('Platform');
}
