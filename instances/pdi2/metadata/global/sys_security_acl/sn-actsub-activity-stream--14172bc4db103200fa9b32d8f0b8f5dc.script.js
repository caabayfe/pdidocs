answer = execute();

function execute() {
    return new global.ActivityService().hasAccessToActivityStream(ActivityConstants.WRITE, current);
}
