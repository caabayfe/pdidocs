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
    const firstDivContent = await helpers.translate("This recommendation is guidance from our experts to help you address your adoption blueprint. It's based on what you've already installed and your progress within the adoption blueprint.");
    const secondDivContent = await helpers.translate("When deciding what to install, also consider your organization's needs and readiness.");
    const header = await helpers.translate('About this recommendation');
    const buttonLabel = await helpers.translate('Close');
    let htmlContent = `
      <style>
          .modal-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            font-size: var(--now-global-font-size--md, 16px);
            line-height: 19px;
            font-family: var(--now-font-family, 'Lato');
            font-style: normal;
            gap:  var(--now-global-space--lg, 1rem);
          }
      </style>
      <div class='modal-content'>
        <div>${firstDivContent}</div>
        <div>${secondDivContent}</div>
      </div>`;

    api.emit('ACE_ACTION_PERFORMED_RELAY_23cbf6ccb70201109cfe23508e11a9c1', {
        eventName: 'OPEN_INFO_MODAL',
        eventPayload: {
            header: header,
            content: htmlContent,
            buttonLabel: buttonLabel
        }
    });
}
