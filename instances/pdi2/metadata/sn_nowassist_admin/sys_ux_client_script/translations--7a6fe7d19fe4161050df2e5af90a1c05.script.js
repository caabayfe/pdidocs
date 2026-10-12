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

    const header1Label = await helpers.translate('When should I block prompt injection attempts?');
    const accordionItem1Header = {
        label: header1Label || 'When should I block prompt injection attempts?',
        size: "md",
        variant: "primary",
        weight: "normal"
    };

    api.setState('accordionItem1Header', accordionItem1Header);


    const header2Label = await helpers.translate("If I turn off prompt injection protection, are my requests still monitored?");
    const accordionItem2Header = {
        label: header2Label || 'If I turn off prompt injection protection, are my requests still monitored?',
        size: "md",
        variant: "primary",
        weight: "normal"
    };

    api.setState('accordionItem2Header', accordionItem2Header);


    const turnOffLabel = await helpers.translate("Prompt Injection has been turned off.");
    api.setState('turnOffLabel', turnOffLabel);

    const turnOnLabel = await helpers.translate("Prompt Injection has been turned on.");
    api.setState('turnOnLabel', turnOnLabel);

    const errorLabel = await helpers.translate("Something went wrong while configuring Prompt Injection. Please try again.");
    api.setState('errorLabel', errorLabel);

}
