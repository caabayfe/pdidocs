doInsertAndStay();
function doInsertAndStay() {
    var saveMe = current;
    if (typeof current.number != 'undefined' && current.number)
        current.number = ""; // generate a new number
    else if (typeof current.u_number != 'undefined' && current.u_number)
        current.u_number = ""; // generate a new number
    current.insert();
    action.setRedirectURL(saveMe);
}
