function script({
    api,
    event
}) {
    const isDRRPluginInstalled = api.data.get_task_aggregation_query.output ? api.data.get_task_aggregation_query.output.isDRRPluginInstalled : false;
    return (!api.state.hasRecentTasks || !isDRRPluginInstalled);
}
