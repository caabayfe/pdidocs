const ActivityService = (function() {

    const QUERY_STRING_PREFIX = Object.freeze({
        STARTSWITH: "user.nameSTARTSWITH",
        CONTAINS: "user.nameCONTAINS",
    });

    return class ActivityService {
        static type = "ActivityService";

        static #USER_RESULT_LIMIT = 15; // default used on the front-end

        static #TABLE_NAMES = {
            GRMEMBER: "sys_user_grmember",
            GROUP: "sys_user_group",
            USER: "sys_user",
            CRS_ACTIVITY: "sn_creatorstudio_activity"
        };

        /**
         * You only get what we give you!
         */
        static #glideRecordToUser(gr) {
            return Object.freeze({
                value: gr.getUniqueValue(),
                displayValue: gr.getDisplayValue(),
            });
        }

        /**
         * Gets users by groupId for specific CS activities, including Assign to and Create Task
         * @param groupId
         * @param resultLimit
         * @param additionalQueryString
         * @returns [Users] - Array of user objects
         */
        static getUsersByGroupId(
            groupId,
            resultLimit = ActivityService.#USER_RESULT_LIMIT,
            additionalQueryString = ""
        ) {
            if (!groupId) return {};

            // The group record must exist and the user must have access to it
            const groupGr = new GlideRecordSecure(ActivityService.#TABLE_NAMES.GROUP);
            const groupRecord = groupGr.get('sys_id', groupId);
            if (!groupRecord) return {};

            const gr = new GlideRecordSecure(ActivityService.#TABLE_NAMES.USER);
            const joinQuery = gr.addJoinQuery(ActivityService.#TABLE_NAMES.GRMEMBER, 'sys_id', 'user');
            joinQuery.addCondition('group', groupId);
            gr.chooseWindow(0, resultLimit, true);

            // DEF0510945:
            // Parsing the value from additionalQueryString and using the value in GlideRecordSecure.addQuery().
            // This enforces that only a query for the name field with either CONTAINS or STARTSWITH operator can be executed.
            if (typeof additionalQueryString === 'string') {
                if (additionalQueryString.startsWith(QUERY_STRING_PREFIX.CONTAINS)) {
                    const value = additionalQueryString.replace(QUERY_STRING_PREFIX.CONTAINS, "");
                    gr.addQuery("name", "CONTAINS", value);
                } else if (additionalQueryString.startsWith(QUERY_STRING_PREFIX.STARTSWITH)) {
                    const value = additionalQueryString.replace(QUERY_STRING_PREFIX.STARTSWITH, "");
                    gr.addQuery("name", "STARTSWITH", value);
                }
            }

            gr.orderBy("name");
            gr.query();

            const totalMatchesCount = gr.getRowCount();

            const users = [];

            while (gr.next()) {
                users.push(ActivityService.#glideRecordToUser(gr));
            }

            return {
                users,
                totalMatchesCount,
            };
        }

        static getActivities() {
            const crsActivitiesGr = new GlideRecordSecure(ActivityService.#TABLE_NAMES.CRS_ACTIVITY);
            crsActivitiesGr.addQuery("active", true);
            crsActivitiesGr.orderBy("order");
            crsActivitiesGr.query();
            const activities = [];
            while (crsActivitiesGr.next()) {
                activities.push({
                    sysId: crsActivitiesGr.getValue("activity"),
                    caption: {
                        value: crsActivitiesGr.getValue("short_description"),
                        displayValue: crsActivitiesGr.getDisplayValue("short_description")
                    },
                    order: crsActivitiesGr.getValue("order"),
                    label: crsActivitiesGr.getDisplayValue("activity")
                });
            }
            return activities;
        }
    };
})();
