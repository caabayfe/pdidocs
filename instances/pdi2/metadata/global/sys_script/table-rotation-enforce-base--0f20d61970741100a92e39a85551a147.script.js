current.setAbortAction(true);
    var sanitizedName = GlideStringUtil.escapeHTML(current.name);
    if (!gs.tableExists(sanitizedName))
        gs.addErrorMessage(gs.getMessage("Table does not exist: {0}", sanitizedName));
    else if ((/[0-9]$/).test(sanitizedName))
        gs.addErrorMessage(gs.getMessage("Table name cannot end with a number"));
    else if (gs.isDatabaseView(sanitizedName))
        gs.addErrorMessage(gs.getMessage("Table is a Database View which cannot be rotated or extended: {0}", sanitizedName));
	else if (GlideTableDescriptor.isDataFabricTable(sanitizedName))
		gs.addErrorMessage(gs.getMessage("Table is of type Data Fabric which cannot be rotated or extended: {0}", sanitizedName));
    else
        gs.addErrorMessage(gs.getMessage("Only base tables can be setup for rotation - the base table for {0} is {1}",[sanitizedName, GlideDBObjectManager.get().getAbsoluteBase(sanitizedName)]));
