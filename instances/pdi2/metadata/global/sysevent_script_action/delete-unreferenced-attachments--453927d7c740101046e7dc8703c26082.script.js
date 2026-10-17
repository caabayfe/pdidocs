
var tableProperties = event.parm2.split(',');

var targetTableName = tableProperties[0];
var targetTableId = tableProperties[1];
if (tableProperties.length > 2) {
	var outdatedAttachments = tableProperties[2];
	sn_sc.CatalogVariableUtil.clearOldAttachments(targetTableName, targetTableId, outdatedAttachments);
}
else
	sn_sc.CatalogVariableUtil.removeUnusedAttachments(targetTableName, targetTableId);

	
