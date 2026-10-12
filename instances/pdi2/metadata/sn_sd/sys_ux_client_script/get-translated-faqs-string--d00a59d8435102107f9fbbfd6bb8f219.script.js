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
    let translatedFAQs = [{
            question: await helpers.translate("What happens when I Revert to out of the box dashboard?"),
            answer: await helpers.translate("When you select the Revert to out of the box dashboard, the customized dashboard is inactivated and the default dashboard is activated."),
            elm: {}
        },
        {
            question: await helpers.translate("When should I navigate to Analytics Center?"),
            answer: await helpers.translate("When you want to add more visualization to the dashboard, you can navigate to the dashboard builder in Analytics Center.")
        }
    ];

    api.setState("FAQs", translatedFAQs);
}
