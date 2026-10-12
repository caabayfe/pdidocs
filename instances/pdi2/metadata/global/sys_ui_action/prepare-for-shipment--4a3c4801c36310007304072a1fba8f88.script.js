pushStageFromTO();

function pushStageFromTO() {
    var transferOrderStageHandler = new TransferOrderStageHandler();
    transferOrderStageHandler.pushStageFromTO(current,'shipment_preparation');
    action.setRedirectURL(current);   
}
