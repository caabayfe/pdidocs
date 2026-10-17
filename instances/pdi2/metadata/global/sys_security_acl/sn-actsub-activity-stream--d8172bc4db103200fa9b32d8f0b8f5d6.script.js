answer = execute();

function execute() {
    return new global.ActivityService().hasAccessToActivityStream(ActivityConstants.READ, current);
}
