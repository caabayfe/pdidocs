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
    var domaindb = api.data.get_user_domain_1;
    var domain = domaindb && domaindb.output.domain;
    if (domain !== "global") {
        api.setState('isGlobalDomain', false);
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
        api.setState('finalizeClicked', false);
        // Close the modal if its open, when throwing domain error.
        if (api.state.modalContinueClicked) {
            helpers.modal.close('dependency_assignment_note', {
                bare: true
            });
            api.setState('modalContinueClicked', false);
        }
        return;
    }

    // Launches the finalize model if its global domain , else would have thrown error by now.
    if (api.state.finalizeClicked) {
        helpers.modal.open('dependency_assignment_note', {
            bare: true
        });
        api.setState('finalizeClicked', false);
        return;
    }

    if (api.state.modalContinueClicked) {
        // Close the modal and redirect to setup-finalize page.
        helpers.modal.close('dependency_assignment_note', {
            bare: true
        });

        const {
            setupId,
            processId
        } = api.context.props;

        helpers.navigate.to('setup-finalize', {
            'id': setupId,
            'processId': processId
        });

        api.setState('modalContinueClicked', false);
        return;
    }

}
