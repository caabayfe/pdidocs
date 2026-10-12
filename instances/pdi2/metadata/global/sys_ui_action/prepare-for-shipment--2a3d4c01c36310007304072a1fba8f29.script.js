pushStageFromTOL();

function pushStageFromTOL() {
    current.stage = 'shipment_preparation';
    current.update();
    var transferOrderStageHandler = new TransferOrderStageHandler();
    transferOrderStageHandler.pushStageFromTOL(current,'shipment_preparation');
}
