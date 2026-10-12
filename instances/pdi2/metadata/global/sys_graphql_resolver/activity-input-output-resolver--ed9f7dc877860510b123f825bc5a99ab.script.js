(function process( /*ResolverEnvironment*/ env) {
    var padUtils = new PADUtilsSI();
    if (!padUtils.isPADAuthorizedUser())
        return null;

    var sysId = env.getArguments().sysId;
    var activityGr = new GlideRecordSecure('sys_pd_activity');
    activityGr.get(sysId);

    var glideVariableInputRecord = activityGr.getElement('inputs').getVariablesRecord();
    var glideVariableOutputRecord = activityGr.getElement('outputs').getVariablesRecord();

    var elementsList = glideVariableOutputRecord.getElements();
    var activityOutputs = [];

    for (var i = 0; i < elementsList.size(); i++) {
        var element = elementsList.get(i);
        var elementDescriptor = element.getED();

        var type = elementDescriptor.getInternalType();
        var typeLabel = '';
        var attributes = [];

        var gr = new GlideRecord('sys_glide_object');
        gr.addQuery('name', type);
        gr.addQuery('visible', true);
        gr.orderByDesc('sys_created_on');
        gr.query();
        if (gr.next()) {
            typeLabel = gr.getValue('label');
        }

        try {
            if (elementDescriptor) {
                if (elementDescriptor.getAttribute('dynamic')) {
                    attributes.push('dynamic=true');
                }
                if (elementDescriptor.getAttribute('custom_schema')) {
                    attributes.push('custom_schema=true');
                }
            }
        } catch (e) {
            gs.debug('Error getting attributes for output ' + element.getName() + ': ' + e);
        }

        activityOutputs.push({
            name: element.getName(),
            label: element.getLabel(),
            type: type,
            typeLabel: typeLabel,
            attributes: attributes.length > 0 ? attributes : null
        });
    }

    return {
        activitySysId: sysId,
        inputs: PDUtils.getGlideVariablesMetadata('inputs', glideVariableInputRecord),
        outputs: activityOutputs
    };
})(env);
