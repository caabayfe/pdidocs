current.update();

var mlHelper = new AutoResolutionMLHelper(current.getUniqueValue());
var result = mlHelper.createSolutionAndTrain();

if (result.status == 'error') 
	gs.addErrorMessage(result.msg);
