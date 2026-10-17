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

    if (domain !== "global") {
        throwDomainError();
        // If edit modal is open close that.
        if (api.state.modalContinueClicked) {
            helpers.modal.close('edit_check', {
                bare: true
            });
            api.setState('modalContinueClicked', false);
        }
        return;
    }

    // Upon click of continue in modal, moving setup to draft.
    if (api.state.modalContinueClicked) {
        const templateFields = `status=draft`;
        api.data.draft_setup.execute({
            table: 'help_guidance',
            recordId: api.context.props.setupId,
            templateFields,
            useSetDisplayValue: null
        });
        api.setState('modalContinueClicked', false);
        return;
    }


    if (api.state.continueClicked) {

        api.setState('continueClicked', false);

        // If global and published, then only show modal to change to draft.
        if (api.state.isSetupPublished) {
            api.emit('MODAL_SELECTED', {
                modalId: "[component-id$='edit_check']",
                showModal: true,
                bare: true,
                displayOptions: {
                    size: "md"
                }
            });
            return;
        }

        // If draft, continue creating / editing the setup
        if (api.context.props.setupId === "-1") {
            helpers.navigate.to("setup", {
                "id": api.context.props.setupId
            });
        } else if (api.context.props.setupId) {
            const templateFields = `status=draft`;
            api.data.draft_setup.execute({
                table: 'help_guidance',
                recordId: api.context.props.setupId,
                templateFields,
                useSetDisplayValue: null
            });
        }
    }
}
