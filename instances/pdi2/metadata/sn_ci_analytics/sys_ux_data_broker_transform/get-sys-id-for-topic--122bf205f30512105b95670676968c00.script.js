function transform(input) {
    var output = {
        id: ''
    };
    var vaDashboardUtils = new VADashboardUtils();
    switch (input.event_type) {
        case 'Topic':
            output.id = vaDashboardUtils.getSysIdForTopic(input.name);
            break;
        case 'Topic Category':
            output.id = vaDashboardUtils.getSysIdForTopicCategory(input.name);
            break;
        case 'Spoke':
            output.id = vaDashboardUtils.getSysIdForSpoke(input.name);
            break;
    }
    output.event_type = input.event_type;
    return output;
}
