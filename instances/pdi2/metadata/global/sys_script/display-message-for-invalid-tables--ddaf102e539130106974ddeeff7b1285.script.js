var tableName = current.getValue("table");

if (!gs.nil(tableName) && !GlideTableDescriptor.isValid(tableName)) {
    var message = gs.getMessage("The referenced table couldn't be found. It may come from a plugin or app that has not been installed.");
    gs.addInfoMessage(message);
}
