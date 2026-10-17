function transporm(input) {
	var quantity = parseInt(input.quantity, 10);
	var newAssetSysID = new global.PreAllocatedAssets().splitRecord(input.sysId,quantity);
	return newAssetSysID;
}
