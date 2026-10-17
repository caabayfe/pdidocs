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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    var blockcontext = await aceUtils.getContext();
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "toggle-change") {
        // Announcements Tier1 and Tier2
        if (eventPayload.contentBlockId == "276668f69314021004e40b2764891899" || eventPayload.contentBlockId == "ed3338b69354021004e40b2764891818") {
            blockcontext.sectionName = await helpers.translate("announcements");
            blockcontext.sectionProperty = "announcements";
        }
        // Upcoming Tier1 and Tier2
        else if (eventPayload.contentBlockId == "2f666c3a9314021004e40b276489186e" || eventPayload.contentBlockId == "6d3338b69354021004e40b2764891823") {
            blockcontext.sectionName = await helpers.translate("upcoming tasks");
            blockcontext.sectionProperty = "upcoming";
        }
        // Quick Links Tier1 and Tier2
        else if (eventPayload.contentBlockId == "a7666c3a9314021004e40b2764891871" || eventPayload.contentBlockId == "e93338b69354021004e40b276489182e") {
            blockcontext.sectionName = await helpers.translate("quick links");
            blockcontext.sectionProperty = "quick_links";
        }

        //Updating Tier1 properties - Annoucenments, Upcoming, Quick Links sys id's
        if (eventPayload.contentBlockId == "276668f69314021004e40b2764891899" || eventPayload.contentBlockId == "2f666c3a9314021004e40b276489186e" || eventPayload.contentBlockId == "a7666c3a9314021004e40b2764891871") {
            blockcontext.variant = "82ed0d8447404210f9bc5222516d4347";
            blockcontext.tier1[blockcontext.sectionProperty] = String(eventPayload.value);
        }
        //Updating Tier2 properties - Annoucenments, Upcoming, Quick Links sys id's
        else if (eventPayload.contentBlockId == "ed3338b69354021004e40b2764891818" || eventPayload.contentBlockId == "6d3338b69354021004e40b2764891823" || eventPayload.contentBlockId == "e93338b69354021004e40b276489182e") {
            blockcontext.variant = "37fd4d8447404210f9bc5222516d43c2";
            blockcontext.tier2[blockcontext.sectionProperty] = String(eventPayload.value);
        }

        var isToggleDisabled = eventPayload.value;
        blockcontext.modalHeader = isToggleDisabled ?
            await helpers.translate("Show {0}", (blockcontext.sectionName).toLowerCase()) :
            await helpers.translate("Hide {0}", (blockcontext.sectionName).toLowerCase());

        let agentView = blockcontext.variant === "82ed0d8447404210f9bc5222516d4347" ? await helpers.translate("Tier 1") :
            await helpers.translate("Tier 2");

        blockcontext.confirmationModalDescription = isToggleDisabled ?
            await helpers.translate("Are you sure you want to show {0} on the SOW homepage for all {1} Agents?", [blockcontext.sectionName.toLowerCase(), agentView]) :
            await helpers.translate("Are you sure you want to hide {0} on the SOW homepage for all {1} Agents?", [blockcontext.sectionName.toLowerCase(), agentView])

        await aceUtils.setContext(blockcontext);
        aceUtils.openModal("bd53-fe70-8ba9ab-4680-b89a99ab"); //Confirmation Modal
    } else if (eventName == "toggle-change-list-collapse") {
        var isToggleDisabled = eventPayload.value;
        var modelDesc = isToggleDisabled ?
            await helpers.translate("Are you sure you want to collapse the landing page lists by default while loading the landing page? A user will be able to view the lists by selecting any part of the donut.") :
            await helpers.translate("Are you sure you want to expand the landing page lists by default while loading the landing page? It might increase the loading time on the first load of the landing page.");
        blockcontext.confirmationModalDescription = modelDesc;
        blockcontext.sectionName = await helpers.translate("Lists");
        blockcontext.collapseList = String(isToggleDisabled);
        blockcontext.modalHeader = isToggleDisabled ?
            await helpers.translate("Hide Lists") :
            await helpers.translate("Show Lists");

        await aceUtils.setContext(blockcontext);
        aceUtils.openModal("c6b1-f5dd-99bbbb-fc90-b8b9b889");
    }
}
