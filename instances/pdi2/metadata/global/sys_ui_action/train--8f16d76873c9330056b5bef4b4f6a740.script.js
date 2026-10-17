var response = NLUStudioTrainer.trainModel(current.getUniqueValue());
if(response.status === 'success'){
	gs.addInfoMessage(gs.getMessage('The model has been successfully trained.'));
} else {
	gs.addErrorMessage(gs.getMessage('Unable to train the model at this time. Please try again after some time.'));
}
