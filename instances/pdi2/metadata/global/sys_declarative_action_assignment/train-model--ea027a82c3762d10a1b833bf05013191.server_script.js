current.update();

var mlHelper = new global.AutoResolutionMLHelper(current.getUniqueValue());
var result = mlHelper.createSolutionAndTrain();

if (result.status == 'error') 
	gs.addErrorMessage(result.msg);
