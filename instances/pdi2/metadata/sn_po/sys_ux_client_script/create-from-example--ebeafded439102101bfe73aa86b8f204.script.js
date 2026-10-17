/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    switch(api.state.selectedExample) {
        case 'custom_finding_example': {
            helpers.navigate.to('rule-based-finding-setup', {
                classType: api.context.props.projectId ? 'PROJECT' : 'PROCESS',
                classId: api.context.props.projectId || api.context.props.processId,
            }, {
                findingDefId: ''
            }, true);
            break;
        }
        case 'ping_pong_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'ping_pong',
            }, true);
            break;
        }
        case 'extra_step_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'extra_step',
            }, true);
            break;
        }
        case 'slow_transitions_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'slow_transition',
            }, true);
            break;
        }
          case 'slow_duration_node_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'slow_duration_node',
            }, true);
            break;
        }
        case 'extreme_duration_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'extreme_duration',
            }, true);
            break;
        }
        case 'extreme_duration_node_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'extreme_duration_node',
            }, true);
            break;
        }
        case 'extreme_repetitions_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'extreme_repetition',
            }, true);
            break;
        }
        case 'repeating_pattern_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'repeating_patterns',
            }, true);
            break;
        }
        case 'rework_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'rework',
            }, true);
            break;
        }
        case 'extreme_node_touchpoints_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'extreme_node_touch_point',
            }, true);
            break;
        }
        case 'high_touchpoints_node_example': {
            helpers.navigate.to("configure-finding-pattern", {
                projectId: api.context.props.projectId || api.context.props.processId,
            }, {
                patternName: 'high_touchpoints_node',
            }, true);
            break;
        }
    }
}
