(function executeRule(current, previous /*null when async*/) {
var ownerID = current.documentkey;
var ownerTbl = current.tablename;

if (isVirtualTable(ownerTbl))
	return;

if (!ownerID.nil() && !ownerTbl.nil()) {
	var owner = new GlideRecord(ownerTbl);
	if (!gs.nil(owner) && owner.get(ownerID)) {
		var ownerAttr = owner.getAttribute("update_synch");
		if (ownerAttr!= null && !"false".equals(ownerAttr))
			gs.updateSave(owner);
	}
}

function isVirtualTable(tableName) {
	if (tableName.nil())
		return false;

	return tableName.startsWith("v_") || tableName.startsWith("virtual_") || tableName.startsWith("var__");
}

})(current, previous);
