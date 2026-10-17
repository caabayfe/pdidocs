var MobileMessageUtil = Class.create();

MobileMessageUtil.addSecurityErrorForTable = function(tableName) {
    gs.warn("Cannot read table " + tableName);
    var errorMessage = gs.getMessage("Security constraints prevent access to table");
    gs.addErrorMessage(errorMessage);
};
