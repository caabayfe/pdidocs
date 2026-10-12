var allowedValues = gs.getProperty('com.snc.documents.permalink.allowed_classifications', '');
var allowedList = allowedValues.split(',').map(function(item) {
    return item.trim();
});
var classification = current.getValue('classification');
var isAllowed = !classification || allowedList.indexOf(classification) !== -1;
g_scratchpad.shareDisabled = !isAllowed;
