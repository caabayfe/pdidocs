/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let faqs = [{
            "answer": helpers.translateSync("No, ServiceNow® Benchmarks is included with ITSM or ITOM license."),
            "question": helpers.translateSync("Do customers need to pay for ServiceNow® Benchmarks?")
        },
        {
            "answer": helpers.translateSync("Only designated roles within the organization have access to the organization's Benchmarks data. A customer cannot see another customer's ServiceNow® Benchmarks data. ServiceNow® Benchmarks is governed by the same security requirements as our customer instances."),
            "question": helpers.translateSync("Is my ServiceNow® Benchmarks data secure? Who else can see my Benchmarks?")
        },
        {
            "answer": helpers.translateSync("ServiceNow® Benchmarks KPIs are based on usage data. We take high-level usage data such as Number of Incidents or Number of Requests, anonymize it, aggregate and normalize it. With the Istanbul and later releases, ServiceNow® Benchmarks reports lives in your instance. Only users with specific roles are able to see the data specific to their instance."),
            "question": helpers.translateSync("Is there any other security risk opting into ServiceNow® Benchmarks?")
        },
        {
            "answer": helpers.translateSync('Anyone in your organization who has "Benchmarks Admin" or "Benchmarks Viewer role" can see the ServiceNow® Benchmarks reports.'),
            "question": helpers.translateSync("Who in my organization can see the ServiceNow® Benchmark data?")
        },
        {
            "answer": helpers.translateSync("Yes, ServiceNow® Benchmarks is tightly integrated with Performance Analytics product and PA capabilities are used to collect ServiceNow® Benchmarks values and allow easy drill down and analysis in to your Instance data."),
            "question": helpers.translateSync("Is ServiceNow® Benchmarks using Performance Analytics (PA)?")
        },
        {
            "answer": helpers.translateSync("The ServiceNow® Performance Analytics engine collects the high-level usage count data from all customer instances. This collection happens on daily basis. This data is then anonymized and aggregated to create monthly global benchmark reports. This does not include any company data."),
            "question": helpers.translateSync("Where does the data come from?")
        }
    ];
    return faqs;
}
