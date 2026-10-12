/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var newLine = '\n';
    var faq =
    [{
        "id": "p1",
        "label": await helpers.translate("What can I do with these results?"),
        "children": [
            {
                "id": "c1",
                "label": await helpers.translate("Resolution potential reflects the number of issues that IAR has successfully predicted an active intent for and that has an active topic mapped.{0}{0}To improve your resolution potential:{0}  1. Activate intents that IAR has{0}      successfully predicted but are{0}      inactive.{0}  2. Activate inactive topics that are{0}      mapped to predicted intents.{0}  3. Map additional intents that IAR has{0}      successfully predicted but have not{0}      yet been added to the intent to topic{0}      map table so far.{0}  4. Notice issues that are mapped to{0}      incorrect intents? For better accuracy{0}      and improved results, go to NLU{0}      Workbench to tune your model{0}      regularly.{0}{0}When done, run another simulation to compare results.", newLine)
            }
        ]
    },
    {
        "id": "p2",
        "label": await helpers.translate("What do \"Mapped intents - Active\" and \"Mapped intents - Inactive\" mean?"),
        "children": [
            {
                "id": "c2",
                "label": await helpers.translate("\"Mapped intents - Active\" means that IAR has successfully predicted an intent from the case description and that intent is active in your intent to topic map table. \"Mapped intents - Inactive\" means that the predicted intents are available but not active in your intent to topic map table.")
            }
        ]
    },
    {
        "id": "p3",
        "label": await helpers.translate("What does \"Inactive topics\" mean?"),
        "children": [
            {
                "id": "c3",
                "label": await helpers.translate("\"Inactive topics\" mean that Virtual Agent topics currently mapped to intents are not active and not visible to end users. Select an active topic using the intent to topic map table in the IAR configuration, or go to Virtual Agent Designer to activate the topic.")
            }
        ]
    },
    {
        "id": "p4",
        "label": await helpers.translate("What does \"Unmapped intents\" mean?"),
        "children": [
            {
                "id": "c3",
                "label": await helpers.translate("\"Unmapped intents\" means that IAR has successfully predicted an intent from the case description, but the intent itself has not been added to the intent to topic map table in your configuration. To increase IAR coverage for those incidents, add those additional intents to the table.")
            }
        ]
    }];
    api.setState('faqSection', faq);
}
