answer = execute();

function execute() {
    return new global.ActivityStreamPullService().hasAccessToUserStream(current);
}
