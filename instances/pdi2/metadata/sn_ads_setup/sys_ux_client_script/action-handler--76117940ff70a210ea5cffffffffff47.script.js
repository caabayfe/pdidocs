/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    async function throwDomainError() {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'alert-1',
                status: 'critical',
                icon: 'circle-info-outline',
                content: await helpers.translate("Guided Setup can be updated only in Global domain. Please change the domain and try again."),
                action: {
                    type: 'dismiss'
                }
            }]
        });

    }

    var domaindb = api.data.get_user_domain_1;
    var domain = domaindb && domaindb.output.domain;

    // Handles page load domain error.
    if (domain !== "global") {
        throwDomainError();
        return;
    }

    // Handles clicking continue button , if after page load someone clicks Continue.
    if (api.state.saveSetup) {
        api.setState('saveSetup', false);
        let {
            name,
            description,
            roles,
            setup_execution_type,
            skip_execution_page,
            setup_layout
        } = api.state.pageInput;

        var templateFields = `name=${name}^description=${description}^type=global_setup^roles=${roles}^process_definition=${api.state.processId}^setup_execution_type=${setup_execution_type}^skip_execution_page=${skip_execution_page}^setup_layout=${setup_layout}`;
        if (api.context.props.id === '-1') {
            api.data.create_record_1.execute({
                table: 'help_guidance',
                templateFields
            });

        } else if (api.data.get_setup_info.items && api.data.get_setup_info.items.length !== 0) {
            const currentSetupInfo = api.data.get_setup_info.result;

            const isUpdateRequired = (currentSetupInfo.setup_execution_type.value != setup_execution_type) || (currentSetupInfo.skip_execution_page.value != skip_execution_page) || (currentSetupInfo.roles.value != roles) || (currentSetupInfo.setup_layout.value != setup_layout);
            
            if (isUpdateRequired) {
                api.data.update_record_1.execute({
                    table: 'help_guidance',
                    recordId: api.context.props.id,
                    templateFields
                });
            } else {
                  helpers.navigate.to("setup-detail", {
                "setupId": api.context.props.id,
                "processId": currentSetupInfo.process_definition.value
            });
            }
        }
        return;
    }
}
