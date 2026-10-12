/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
            "header": {
                "label": helpers.translateSync("What is data sharing?"),
                "size": "md",
                "variant": "primary",
                "weight": "normal",
            },
            "answer": helpers.translateSync("AI algorithms require data to identify patterns and learn. Without data, AI models cannot make predictions or generate useful content. When you use generative AI capabilities across the Now Platform, ServiceNow collects and uses that data to improve our models.")
        },
        {
            "header": {
                "label": helpers.translateSync("Why does ServiceNow want to use my data?"),
                "size": "md",
                "variant": "primary",
                "weight": "normal",
            },
            "answer": helpers.translateSync("Sharing your data enables ServiceNow to enhance the user experience, tailor products to your business needs, and improve model accuracy. Your input can help AI models learn from real-world scenarios, allowing for smarter and more contextually aware interactions.")
        },
        {
            "header": {
                "label": helpers.translateSync("What data is ServiceNow using?"),
                "size": "md",
                "variant": "primary",
                "weight": "normal",
            },
            "answer": helpers.translateSync("ServiceNow uses the inputs, outputs, and edits to the outputs of the application. We may also collect data used or generated in connection with the generative AI application, such as the script or record in which the application is called or used.")
        },
        {
            "header": {
                "label": helpers.translateSync("How does ServiceNow protect my data privacy?"),
                "size": "md",
                "variant": "primary",
                "weight": "normal",
            },
            "answer": helpers.translateSync("Personal identifiable information (PII) and sensitive data are anonymized and cleansed from any data collected. ServiceNow will never resell or share your data. For more information, reach out to the Now Support team or your Account Executive.")
        },
        {
            "header": {
                "label": helpers.translateSync("How do I opt back in to data sharing?"),
                "size": "md",
                "variant": "primary",
                "weight": "normal",
            },
            "answer": helpers.translateSync("You must work with the Now Support team or your Account Executive if you wish to opt back in to data sharing.")
        }
    ];
}
