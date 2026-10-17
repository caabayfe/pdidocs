try {
    current.update();
    SNC.ProcessOptimization.scheduleMining(current.getUniqueValue(), false);
} catch (error) {
    gs.addErrorMessage(error.getMessage());
}
action.setRedirectURL(current);
