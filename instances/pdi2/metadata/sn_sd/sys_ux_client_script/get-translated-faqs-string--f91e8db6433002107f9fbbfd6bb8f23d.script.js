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
            question: await helpers.translate("What is Process Mining?"),
            answer: await helpers.translate("Process Mining helps process owners to quickly analyze the bottlenecks in the existing process and optimize their business processes."),
            elm: {}
        },
        {
            question: await helpers.translate("How would it reflect on dashboard?"),
            answer: await helpers.translate("Process Mining will be displayed for all the indicators which have the contributing indicator mapped with Process Mining. It is displayed in the side panel under Insights section.")
        },
        {
            question: await helpers.translate("How do we customize it?"),
            answer: await helpers.translate("You can customize any out of box record with the Process Mining project or you can create a new record  with the contributing indicator mapped with Process Mining.")

        }
    ];

    api.setState("FAQs", translatedFAQs);
}
