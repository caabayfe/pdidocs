pushStageFromTOL();

function pushStageFromTOL() {
    current.stage = 'in_transit';
    current.update();
    var transferOrderStageHandler = new TransferOrderStageHandler();
    transferOrderStageHandler.pushStageFromTOL(current,'in_transit');
}
