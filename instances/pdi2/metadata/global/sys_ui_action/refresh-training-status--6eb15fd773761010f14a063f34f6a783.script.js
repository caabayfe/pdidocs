var mlHelper = new AutoResolutionMLHelper(current.getUniqueValue());
mlHelper.trainingJobStatusCheck();

if (mlHelper.checkAllLanguageModelsTrainingCompleted()) 
	//disable the training status polling once the current training is completed
	mlHelper.toggleScheduleJobActive(false);	
else
	gs.addInfoMessage(gs.getMessage('Machine learning model training is in progress.'));

current.update();
action.setRedirectURL(current);
	
