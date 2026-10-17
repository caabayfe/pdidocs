var response = NLUStudioPublisher.publishModel(current.getUniqueValue());
if (response.status === 'success') {
    gs.addInfoMessage(gs.getMessage('The model has been successfully published.'));
} else {
    gs.addErrorMessage(gs.getMessage('There was an error when publishing the model. Please try again after some time.'));
}
