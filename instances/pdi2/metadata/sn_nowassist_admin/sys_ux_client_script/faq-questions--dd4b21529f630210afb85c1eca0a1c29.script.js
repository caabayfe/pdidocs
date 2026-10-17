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
    const header1Label = await helpers.translate("How does the Now Assist context menu improve writing?");
    const accordionItem1Header = {
        label: header1Label,
        size: "md",
        variant: "primary",
        weight: "normal"
    };
    api.setState('accordionItem1Header', accordionItem1Header);
    const header2Label = await helpers.translate("How do I get started with the Now Assist context menu?");
    const accordionItem2Header = {
        label: header2Label,
        size: "md",
        variant: "primary",
        weight: "normal"
    };
    api.setState('accordionItem2Header', accordionItem2Header);
    const header3Label = await helpers.translate("Can I make changes to the suggested text?");
    const accordionItem3Header = {
        label: header3Label,
        size: "md",
        variant: "primary",
        weight: "normal"
    };
    api.setState('accordionItem3Header', accordionItem3Header);
    const header4Label = await helpers.translate("Can I give feedback on suggestions?");
    const accordionItem4Header = {
        label: header4Label,
        size: "md",
        variant: "primary",
        weight: "normal"
    };
    api.setState('accordionItem4Header', accordionItem4Header);
}
