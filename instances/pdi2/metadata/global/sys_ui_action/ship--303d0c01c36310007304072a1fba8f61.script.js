pushStageFromTO();

function pushStageFromTO() {
    var transferOrderStageHandler = new TransferOrderStageHandler();
    transferOrderStageHandler.pushStageFromTO(current,'ship');
    action.setRedirectURL(current);
}
