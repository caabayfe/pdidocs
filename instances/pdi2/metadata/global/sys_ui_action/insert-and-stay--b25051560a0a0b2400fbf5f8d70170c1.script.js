doInsertAndStay();
function doInsertAndStay() {
    var saveMe = current;
    current.insert();
    action.setRedirectURL(saveMe);
}
