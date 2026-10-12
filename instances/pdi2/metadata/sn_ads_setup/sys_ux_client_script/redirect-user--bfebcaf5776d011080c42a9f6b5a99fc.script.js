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

    // Continue button
    if (event.name === 'NOW_BUTTON#CLICKED' && event.elementId === 'primary_action') {

        // Refresh the data broker 
        api.setState('continueClicked', true);
        api.data.get_user_domain_1.refresh();
    }

    // Cancel button of modal , which closes the modal and redirect to home page. 
    if ((event.name === 'NOW_BUTTON_BARE#CLICKED' && event.elementId === 'cancel_button') ||
        (event.name === 'NOW_BUTTON#CLICKED' && event.elementId === 'edit_exit')) {
        helpers.modal.close('edit_check');
        helpers.navigate.to("home", {}, {
            "customId": new Date().getTime()
        });
    }

    // Edit button of modal executes this data broker when existing setup modifies.
    if (event.name === 'DATA_OP_SUCCEEDED' && event.elementId === 'draft_setup') {
        helpers.modal.close('edit_check');
        // To know if its a cross scope based on platform behaviour.
        if (event.payload.data.output.data.GlideRecord_Mutation.update_help_guidance !== null) {
            if (api.state.isSetupPublished) {
                helpers.navigate.to("setup", {
                    "id": api.context.props.setupId
                });
            } else {
                helpers.navigate.to("setup-detail", {
                    "setupId": api.context.props.setupId,
                    "processId": api.state.processId
                });
            }
        } else {
            api.setState('hideAlert', false);
        }
    }

    // Notification cross icon to go to home page , fine in both global/nonGlobal domains.
    if (event.name === 'NOW_ALERT#ACTION_CLICKED' && event.elementId === 'scope_alert') {
        api.setState('hideAlert', true);
        helpers.navigate.to("home", {}, {
            "customId": new Date().getTime()
        });
    }



}
