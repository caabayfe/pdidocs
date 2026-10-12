const ActivityDefinitionService = (function() {
    return class ActivityDefinitionService {
        static type = "ActivityDefinitionService";
        static #TABLE_NAME = "sys_pd_activity_definition";

        // Activity definitions supported by Creator Studio
        static ADD_APPROVAL_ID = "1e1c6cb0c34121107b79e548fa40dd09";
        static ASSIGN_TO_ID = "e2cfe4fd430121103101d1b4bab8f279";
        static CREATE_TASK_ID = "410be4af534961106511ddeeff7b1254";
        static PLACEHOLDER_ID = "ceac99e01b3f0010affd0e55cc4bcb83";

        static ACTIVITY_DEFINITIONS = [
            ActivityDefinitionService.ADD_APPROVAL_ID,
            ActivityDefinitionService.ASSIGN_TO_ID,
            ActivityDefinitionService.CREATE_TASK_ID,
            ActivityDefinitionService.PLACEHOLDER_ID,
        ];

        static #getInputDisplayPreferences(gr) {
            const regexForSingleDelimiter = /;+/g;
            const regexForTrimmingLeadingAndTrailing = /^;+|;+$/g;
            const inputDisplayPreferences = gr.input_display_preferences;
            if (!inputDisplayPreferences) return {};
            const inputDisplayPreferencesNormalized = inputDisplayPreferences
                .replace(regexForSingleDelimiter, ";")
                .replace(regexForTrimmingLeadingAndTrailing, "");
            const inputDisplayPreferencesList =
                inputDisplayPreferencesNormalized.split(";");

            const displayPreMap = inputDisplayPreferencesList.reduce(
                (acc, curr) => {
                    const [key, val] = curr.split("=");

                    acc[val].push(key);

                    return acc;
                }, {
                    all: [],
                    standard: [],
                    advanced: [],
                }
            );

            return displayPreMap;
        }

        static #glideRecordToActivityDefinition(gr) {
            const data = {
                sysId: gr.getValue("sys_id"),
                activityType: gr.getValue("activity_type"),
                label: gr.getDisplayValue("label"),
                name: gr.getValue("name"),
                sourceId: gr.getValue("source"),
                sourceType: gr.getValue("source_type"),
                scope: gr.getValue("sys_scope"),
                inputDisplayPreferences: ActivityDefinitionService.#getInputDisplayPreferences(gr),
            };

            return Object.freeze(data);
        }

        static getActivityDefinitions() {
            const activityDefinitions = [];
            const gr = new GlideRecordSecure(ActivityDefinitionService.#TABLE_NAME);
            const query = "sys_idIN" + ActivityDefinitionService.ACTIVITY_DEFINITIONS;
            gr.addQuery(query);
            gr.orderBy("label");
            gr.query();

            while (gr.next()) {
                activityDefinitions.push(
                    ActivityDefinitionService.#glideRecordToActivityDefinition(gr)
                );
            }

            return activityDefinitions;
        }
    };
})();
