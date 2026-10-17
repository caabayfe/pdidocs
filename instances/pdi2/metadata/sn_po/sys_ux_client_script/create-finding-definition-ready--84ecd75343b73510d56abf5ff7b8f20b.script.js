/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    helpers.screen.updateStatus({
        title: await helpers.translate('Improvement opportunity definition')
    });
    if (api.context.props.projectId == null && api.context.props.processId == null) {
       api.setState('invalid',true);
    } else {
        api.setState('invalid',false);
    }
    api.setState('id', api.context.props.projectId || api.context.props.processId);
    api.data.get_touch_points_status.execute({
        projectId: api.context.props.projectId || "",
        processId: api.context.props.processId || ""
    });
    // Initialize examples map
    api.setState('exampleMap', {
        custom_finding_example: {
            title: await helpers.translate("Rule-based"),
            subtitle: await helpers.translate("By setting up your own rules, you can focus on specific areas of the process that you'd want to learn more about, allowing for the identification of improvement opportunities for a given use case."),
            imgSrc: "sn_po.rule-based-example.svg",
            caption: await helpers.translate("Examples of rule based improvement opportunity definitions"),
        },
        ping_pong_example: {
            title: await helpers.translate("Ping-Pong"),
            subtitle: await helpers.translate("Surfaces areas in the process where records continuously bounce between two steps. Identifying these loops helps determine the necessary improvements."),
            imgSrc: "sn_po.ping-pong-example.svg",
            caption: await helpers.translate("Ping-Pong is seen here between both assignment groups, caused by continuous reassignment"),
        },
        extra_step_example: {
            title: await helpers.translate("Extra step"),
            subtitle: await helpers.translate("Surfaces variants (routes) in the process that differ by only one additional step, which could possibly be automated or eliminated to save time."),
            imgSrc: "sn_po.extra-step-example.svg",
            caption: await helpers.translate("\"Awaiting verification\" is an extra step"),
        },
        slow_transitions_example: {
            title: await helpers.translate("Slow duration (Transition)"),
            subtitle: await helpers.translate("Surfaces a group of records that have an unusual duration that's higher than the average duration of another group of records. This helps uncover slower progression for a significant group of records."),
            imgSrc: "sn_po.slow-transitions-example.svg",
            caption: await helpers.translate("Group of records (G2) took longer to transition from \"New\" to \"Assigned\""),
        },
        extreme_duration_example: {
            title: await helpers.translate("Extreme duration (Transition)"),
            subtitle: await helpers.translate("Surfaces transitions that take significantly longer than the median duration. This helps uncover potential duration anomalies."),
            imgSrc: "sn_po.extreme-duration-example.svg",
            caption: await helpers.translate("Right-hand side transition takes significantly longer than the median duration (3 days) to complete"),
        },
        extreme_repetitions_example: {
            title: await helpers.translate("Extreme repetition"),
            subtitle: await helpers.translate("Surfaces transitions that are repeated significantly more than the median repetition. This helps uncover potential repetition anomalies."),
            imgSrc: "sn_po.extreme-repetition-example.svg",
            caption: await helpers.translate("Right-hand side transition between \"Work in progress\" and \"Resolved\" occurred significantly more than the median repetition"),
        },
        repeating_pattern_example: {
            title: await helpers.translate("Repeating pattern"),
            subtitle: await helpers.translate("Surfaces the repetition of a specific order of steps. This could signal a chance to improve or automate certain parts or the process that are revisited."),
            imgSrc: "sn_po.repeating-patterns-example.svg",
            caption: await helpers.translate("\"Work in progress\", \"Awaiting verification\", and \"On hold\" were executed multiple times"),
        },
        rework_example: {
            title: await helpers.translate("Rework"),
            subtitle: await helpers.translate("Surfaces repeated process steps. This helps in identifying situations where there could be frequent repetition of work."),
            imgSrc: "sn_po.rework-example.svg",
            caption: await helpers.translate("\"Work in progress\" has been revisited"),
        },
        extreme_node_touchpoints_example: {
            title: await helpers.translate("Extreme touchpoints (Node)"),
            subtitle: await helpers.translate("Surfaces steps with an unusually large number of record updates than the median. This highlights steps that require extremely high effort."),
            imgSrc: 'sn_po.extreme-touchpoints-node-example.svg',
            caption: await helpers.translate('"Work in progress" required 85 record updates to move to any next step which is over 20 times the median.')
        },
        high_touchpoints_node_example: {
            title: await helpers.translate("High touchpoints (Node)"),
            subtitle: await helpers.translate("Surfaces a group of records in a step that has, on average, more updates than another group. This points to high-effort steps demonstrated by some records while others required fewer updates."),
            imgSrc: "sn_po.high-touchpoints-node-example.svg",
            caption: await helpers.translate("Group of records (G2) required more updates to move from \"Work in progress\" to any next step indicating higher effort for these records."),
        },
        extreme_duration_node_example: {
            title: await helpers.translate('Extreme duration (Node)'),
            subtitle: await helpers.translate('Surfaces records that stay in a step for a significantly longer duration than the median. This helps uncover extremely delayed steps.'),
            imgSrc: 'sn_po.extreme-duration-node-example.svg',
            caption: await helpers.translate(' Some records took 115 days to move from \"Work in progress\" to any next step which is over 50 times the median.')
        },
        slow_duration_node_example: {
            title: await helpers.translate("Slow duration (Node)"),
            subtitle: await helpers.translate("Surfaces a group of records that, on average, stay longer in a step than another group. It points to delayed steps demonstrated by some records while others progressed faster."),
            imgSrc: "sn_po.slow-duration-node-example.svg",
            caption: await helpers.translate("Group of records (G2) took longer to move from “On hold” to any next step."),
        },
    });
}
