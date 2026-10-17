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

    const header1Label = await helpers.translate("What is Dynamic Translation");
    const accordionItem1Header = {
        label: header1Label || 'What is Dynamic Translation',
        size: "md",
        variant: "primary",
        weight: "normal"
    };

    api.setState('accordionItem1Header', accordionItem1Header);
    
    const header2Label = await helpers.translate("What is Native Translation");
    const accordionItem2Header = {
        label: header2Label || 'What is Native Translation',
        size: "md",
        variant: "primary",
        weight: "normal"
    };

    const header3Label = await helpers.translate("What if I enable both Native and Dynamic Translation");
    const accordionItem3Header = {
        label: header3Label || 'What if I enable both Native and Dynamic translation?',
        size: "md",
        variant: "primary",
        weight: "normal"
    };

    const header5Label = await helpers.translate("How do I choose the translation service");
    const accordionItem5Header = {
        label: header5Label || 'How do I choose the translation service',
        size: "md",
        variant: "primary",
        weight: "normal"
    };


    
    const header4Label = await helpers.translate("What is the difference between Dynamic Translation and Native Translation");
    const accordionItem4Header = {
        label: header4Label || 'What is the difference between Dynamic Translation and Native Translation?',
        size: "md",
        variant: "primary",
        weight: "normal"
    };

    api.setState('accordionItem4Header', accordionItem4Header);
    const translations = {};

    //Dynamic Translation
    const dtFailureLabel = await helpers.translate("Failed to enable/disable dynamic translation.");
    const dtSuccessLabel = await helpers.translate("Dynamic Translation for Now Assist has been turned off.");
    const dtTurnOnLabel = await helpers.translate("Dynamic Translation for Now Assist has been turned on.");

    translations["failureLabel"] = dtFailureLabel || "Failed to enable/disable dynamic translation";
    translations["successLabel"] = dtSuccessLabel || "Dynamic Translation for Now Assist has been turned off";
    translations["dtTurnOnLabel"] = dtTurnOnLabel || "Dynamic Translation for Now Assist has been turned on";

    //Native Translation
    const ntFailureLabel = await helpers.translate("Failed to enable/disable native translation.");
    const ntSuccessLabel = await helpers.translate("Native Translation service has been turned off.");
    const ntSuccessLabelOn = await helpers.translate("Native Translation service has been turned on.");
    translations["ntFailureLabel"] = ntFailureLabel || "Failed to enable/disable native translation";
    translations["ntSuccessLabel"] = ntSuccessLabel || "Native Translation service has been turned off";
    translations["ntSuccessLabelOn"] = ntSuccessLabelOn || "Native Translation service has been turned on";
    translations["accordionItem2Header"] = accordionItem2Header;
    translations["accordionItem3Header"] = accordionItem3Header;
    translations["accordionItem5Header"] = accordionItem5Header;
    api.setState('translations', translations);
    const text = api.data.lookup_dynamic_translation_property_value?.output?.isAICTInstalled ? '<p>Here are the languages from the selected model providers in the AI Control Tower. View allowed providers in <now-text-link label="Manage model providers" href="/now/now-assist-admin/manage-llms" opens-window="true">. For more language support, enable Dynamic Translation.&nbsp;</p>' :
    '<p>Below are the languages supported by the model providers for native translation. For additional languages, enable Dynamic Translation.</p>';
    const translatedText = await helpers.translate(text);
    api.setState("languageDescription",translatedText || text);
    

}
