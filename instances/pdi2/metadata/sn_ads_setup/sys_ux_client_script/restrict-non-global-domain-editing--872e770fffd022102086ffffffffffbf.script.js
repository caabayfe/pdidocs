async function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Script executes to ensure fetch the latest domain even "without page refresh" and do operations based on usecases(state).

    // Notification to show cross domain editing not allowed.
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

    // Takes outcome of activated process to publish guidance , throw error if failed to activate.
    async function publish(op) {
        const {
            errors,
            success
        } = op;

        if (errors.length > 0) {
            var errorMsg = await helpers.translate('Error occured during guided setup activation; resolve errors on previous page before publishing');
            var alerts = [{
                id: "setup_error_alert_1",
                status: "critical",
                icon: "exclamation-triangle-fill",
                content: errorMsg,
                action: {
                    type: "dismiss"
                }
            }];

            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
                items: alerts
            });
        } else {
            // Publish the setup.
            let templateFields = `status=published`;
            const {
                name: {
                    displayValue: gsName
                },
                description: {
                    displayValue: gsDesc
                },
                process_definition: {
                    _reference: pdObj
                }
            } = api.data.get_setup_info.result;
            if (gsName !== pdObj.label.displayValue) {
                templateFields += `^name=${pdObj.label.displayValue}`;
            }

            if (gsDesc !== pdObj.description.displayValue) {
                templateFields += `^description=${pdObj.description.displayValue}`;
            }

            if (api.state.checklist != null) {
                let checkListText = api.state.checklist.split('\n');
                checkListText = checkListText.join('');
                templateFields = `checklist=${checkListText}^${templateFields}`;
            }
            api.data.publish_setup_1.execute({
                table: 'help_guidance',
                recordId: api.context.props.id,
                templateFields,
                useSetDisplayValue: null
            });
        }
    }

    var domaindb = api.data.get_user_domain_1;
    var domain = domaindb && domaindb.output.domain;

    // Handles page load domain error.
    if (domain !== "global") {
        api.setState('isGlobalDomain', false);
        throwDomainError();
        return;
    } else {
        api.setState('isGlobalDomain', true);
    }

    if (api.state.finalizeClicked) {
        api.setState('finalizeClicked', false);
        publish(api.state.op);
    }

}
