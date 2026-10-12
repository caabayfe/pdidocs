try {
	current.update();
    SNC.ProcessOptimization.scheduleMining(current.getUniqueValue(), true);
} catch (error) {
    gs.addErrorMessage(error.getMessage());
}
action.setRedirectURL(current);
