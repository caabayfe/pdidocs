function transform(input) {

    function updateVaDeflectionConfiguration(deflectionConfigId, deflectionConfigName, deflectionConfigDescription) {
        var gr = new GlideRecord('ssa_deflection_configuration');

        if (deflectionConfigId && gr.get(deflectionConfigId)) {
            gr.setValue('name', deflectionConfigName);
            gr.setValue('description', deflectionConfigDescription);
            gr.setWorkflow(false);
            if (gr.canWrite()) {
                return {
                    'config_id': gr.update(),
                    'success': gs.getMessage('Deflection Configuration updated')
                };
            }
        }

        return {
            'error': gs.getMessage('Deflection Configuration updation failed')
        };

    }

    function createVaDeflectionConfiguration(deflectionConfigName, deflectionConfigDescription) {
        var gr = new GlideRecord('ssa_deflection_configuration');
        gr.initialize();
        gr.setValue('name', deflectionConfigName);
        gr.setValue('description', deflectionConfigDescription);
        gr.setValue('activity_context', "7b43fb645383201033cdddeeff7b1246");
        gr.setWorkflow(false);
        if (gr.canCreate()) {
            return {
                'config_id': gr.insert(),
                'success': gs.getMessage('Deflection Configuration created')
            };
        }

        return {
            'error': gs.getMessage('Deflection Configuration creation failed')
        };
    }

    var deflectionConfigId = input.deflection_configuration_id;
    var response = {};

    if (deflectionConfigId != '-1')
        response = updateVaDeflectionConfiguration(deflectionConfigId, input.name, input.description);
    else
        response = createVaDeflectionConfiguration(input.name, input.description);

    return response;
}
