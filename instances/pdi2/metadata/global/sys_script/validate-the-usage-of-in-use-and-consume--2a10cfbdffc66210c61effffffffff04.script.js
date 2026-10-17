var isAssetConsumable = current.instanceOf('alm_consumable');
var state = current.getValue('install_status');

if (isAssetConsumable && state === '1') {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('In use is an invalid state for consumables, please select correct state'));
} else if (!isAssetConsumable && state === '10') {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage('Consumed is a valid state only for consumables, please select correct state'));
}
