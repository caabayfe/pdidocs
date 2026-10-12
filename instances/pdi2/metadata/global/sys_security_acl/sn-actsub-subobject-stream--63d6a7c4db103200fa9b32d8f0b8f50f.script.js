answer = execute();

function execute() {
    return new global.SubscriptionService().hasAccessToSubObjectStream(ActivityConstants.READ, current);
}
