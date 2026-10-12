/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var home_info = api.data.get_home_info.output;
    var blurbSection = {};
    var blurbIntro = "";

    if (home_info.sn_iar_hr || !home_info.sn_itsm_va) {
        blurbIntro = await helpers.translate("Here's what to expect");
        blurbSection = {
            "blurb1": {
                "title": await helpers.translate("Install apps"),
                "description": await helpers.translate("Get started quickly by installing our collection of IAR-related apps. These apps come pre-configured for various issue types, and the installation should only take about 5 minutes.")
            },
            "blurb2": {
                "title": await helpers.translate("Set up & review"),
                "description": await helpers.translate("When you're finished installing the apps, start the setup process to review and customize any configurations to fit your needs.")
            },
            "blurb3": {
                "title": await helpers.translate("Activate IAR"),
                "description": await helpers.translate("Turn on IAR globally and enable it for each issue type you'd like to automatically resolve. You'll then be able to monitor its performance in real time.")
            }
        };
    } else {
        blurbIntro = await helpers.translate("Here's what's next");
        blurbSection = {
            "blurb1": {
                "title": await helpers.translate("Review configurations"),
                "description": await helpers.translate("Configurations for various issue types are pre-installed with the apps. Review the configurations and update them as per your business needs.")
            },
            "blurb2": {
                "title": await helpers.translate("Test & improve"),
                "description": await helpers.translate("Run a simulation with historical data to test IAR for ITSM Virtual Agent Conversation. Manage topics and intents and tune in NLU Workbench  to increase accuracy and automatically resolve or deflect more issues.")
            },
            "blurb3": {
                "title": await helpers.translate("Activate IAR"),
                "description": await helpers.translate("Turn on IAR globally and enable IAR for individual issue types to go live. You'll be able to track the performance of IAR immediately after you enable them.")
            }
        };
    }

    api.setState("blurbIntro", blurbIntro);
    api.setState("blurbSection", blurbSection);
}
