answer = execute();

function execute(){
	return new global.ActivityService().hasAccessToActivity(current, ActivityConstants.READ);
}
