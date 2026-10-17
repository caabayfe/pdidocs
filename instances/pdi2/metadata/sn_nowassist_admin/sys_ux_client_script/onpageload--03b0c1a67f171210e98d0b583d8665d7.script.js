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
    api.setState(
        "accordionItems", [{
                label: await helpers.translate("Do I need to use my own GPT-4o credentials for Azure OpenAI?"),
                size: "md",
                variant: "primary",
                weight: "normal",
                content: await helpers.translate("No, you will be using GPT-4o credentials for Azure OpenAI through ServiceNow.")
            },
            {
                label: await helpers.translate("How often can I change my LLM provider? "),
                size: "md",
                variant: "primary",
                weight: "normal",
                content: await helpers.translate("You can change the provider at any time.")
            },
            {
                label: await helpers.translate("What skills does this affect? "),
                size: "md",
                variant: "primary",
                weight: "normal",
                content: await helpers.translate("This only affects certain ServiceNow Platform skills, such as conversational experiences. This does not affect skills in other workflows or custom skills.")
            }
        ]
    );
}
