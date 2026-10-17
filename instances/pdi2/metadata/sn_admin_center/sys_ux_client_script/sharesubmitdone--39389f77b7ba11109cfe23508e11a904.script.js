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
    const {
        errors,
        successCount
    } = event.payload.data.output;
    const sharedSuccessMessage = await helpers.translate('{0} shared. ', api.context.props.heading);
    const recipientMessageText = successCount > 1 ? await helpers.translate('{0} recipients', successCount) : await helpers.translate('{0} recipient', successCount);
    const successMessage = await helpers.translate('{0} will receive an email with a link to the {1}', recipientMessageText, api.context.props.heading.toLocaleLowerCase());
    const items = [];

    if (successCount > 0)
      items.push({
          status: 'positive',
          icon: 'check-outline',
          content: {
              type: 'html',
              value: `<span><b>${sharedSuccessMessage}</b>${successMessage}</span>`
          },
          action: {
              type: 'dismiss'
          }
      });

    errors.forEach(error => {
        items.push({
            status: 'critical',
            icon: 'exclamation-triangle-outline',
            content: {
                type: 'html',
                value: '<span>' + error + '</span>'
            },
            action: {
                type: 'dismiss'
            }
        });
    });

    api.setState('selectedUsers', []);
    api.setState('message', '');

    api.data.look_up_last_shared.refresh();

    api.emit('ACE_ACTION_PERFORMED_RELAY_a7714adbb77211109cfe23508e11a928', {
        eventName: 'SHARE_COMPLETE',
        eventPayload: {
            items
        }
    });

}
