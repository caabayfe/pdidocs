async function script({ api, event, helpers }) {
    const TASKS = await helpers.translate("Tasks");
    const { generated_task_count, impacted_row_count } = event.payload?.data?.output;

    const taskScoreJson = [
        {
            "data": [
                {
                    "value": generated_task_count + "" || "0"
                }
            ],
            "metadata": {
                "dataSourceLabel": TASKS.charAt(0).toUpperCase() + TASKS.slice(1)
            }
        }
    ]
    api.setState("tasksScorecardData", taskScoreJson);
}
