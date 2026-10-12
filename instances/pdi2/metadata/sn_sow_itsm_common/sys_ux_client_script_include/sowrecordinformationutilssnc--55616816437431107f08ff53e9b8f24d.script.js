function include({
    imports
}) {
    class SOWRecordInformationUtilsSNC {

        static async getSlaConfig(helpers) {
            var config = [{
                    "configId": "af871ab3532730102d05ddeeff7b124f",
                    "slaTimerLabel": await helpers.translate("Response SLA"),
                    "timeLabel": await helpers.translate("Time to respond")
                },
                {
                    "configId": "aca7d6b3532730102d05ddeeff7b12ec",
                    "slaTimerLabel": await helpers.translate("Resolution SLA"),
                    "timeLabel": await helpers.translate("Time to resolve")
                }
            ];
            return config;
        };
        static getSpIconMapping() {
            return {
                "Microsoft Teams": "microsoft-teams-fill",
                "Zoom": "zoom-outline",
                "TwilioDirect": "twilio-outline",
                "Cisco Webex": "user-group-outline"
            };
        };

        /**
         * Sets the focus for the element specified after given timeout
         *
         * @param {Object} helpers - The helpers API object
         * @param {Number} delay - Length of the time to wait before calling the specified function. (in milliseconds)
         * @param {Object[]} elementId - Array of string containing id of the element on the page to be focused in string.
         * elementId mostly will be single string entry in array unless focus is on a component inside a repeater  
         */
        static setFocus(helpers, delay, elementId) {
            helpers.timing.setTimeout(() => {
                helpers.focus(...elementId)
            }, delay);
        };
    };

    return SOWRecordInformationUtilsSNC;
}
