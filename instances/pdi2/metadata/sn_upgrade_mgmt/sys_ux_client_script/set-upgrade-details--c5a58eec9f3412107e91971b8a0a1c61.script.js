/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        const {convertDateFormat} = imports['sn_upgrade_mgmt.UpgradeManagementUtils']();
        const responseData = api?.data?.get_upgrade_details_overview_page?.output;
        const {upgradeOverviewDetails , checkIfATFInstalled} = responseData?.upgradeDetails;

        const state = responseData?.state;

        function showAvailableVersionCards() {
            if(responseData?.upgradeDetails?.formattedAvailableVersions?.releasedCardsRepeaterData?.length > 3) api.setState("releasedCardsRepeaterData", responseData?.upgradeDetails?.formattedAvailableVersions?.releasedCardsRepeaterData?.slice(0,3));
            else api.setState("releasedCardsRepeaterData", responseData?.upgradeDetails?.formattedAvailableVersions?.releasedCardsRepeaterData);
            api.setState("selectedDropdownIds", responseData?.upgradeDetails?.formattedAvailableVersions?.selectedPatch);

            if(responseData?.upgradeDetails?.formattedAvailableVersions?.releasedCardsRepeaterData?.length <=0) {
            const {upgradeMonitorStatusProviderDetails} = responseData?.upgradeDetails;
                api.setState("completeCard", {
                    show: true,
                    data: {
                        fromReleaseName: upgradeMonitorStatusProviderDetails?.fromReleaseName,
                        toReleaseName: upgradeMonitorStatusProviderDetails?.toReleaseName,
                        finishDate: upgradeMonitorStatusProviderDetails?.finishDate,
                        startDate: upgradeMonitorStatusProviderDetails?.startDate,
                        upgradeDuration: upgradeMonitorStatusProviderDetails?.upgradeDuration
                    }
                });
            }
        }

        function showInProgressCard() {
            if(responseData?.upgradeSessionGRSysIDChanged) {
                api.setState("recordWatcherSysID", responseData?.sys_id);
                api.data.check_if_playbook_present.refresh();
                api.setState("playbookState", "");
                api.setState("loading", true);
            }
            const parsedReleaseNotesUrls = upgradeOverviewDetails?.releaseNotesUrls && JSON.parse(upgradeOverviewDetails?.releaseNotesUrls);
            const parsedAvailableVersions = upgradeOverviewDetails?.availableVersions && JSON.parse(upgradeOverviewDetails?.availableVersions);
            const parsedAvailableFamilyReleases = upgradeOverviewDetails?.availableFamilyReleases && JSON.parse(upgradeOverviewDetails?.availableFamilyReleases);

            const resumeUpgradeData = {};
            const {upgradeMonitorStatusProviderDetails} = responseData?.upgradeDetails;
            if(upgradeMonitorStatusProviderDetails?.state === "pending" && upgradeMonitorStatusProviderDetails?.scheduledUpgradeInfo?.scheduledUpgradeDateTime) {
                resumeUpgradeData.scheduledTime = convertDateFormat(upgradeMonitorStatusProviderDetails?.scheduledUpgradeInfo?.scheduledUpgradeDateTime);
                api.setState("hideUpgradeSchedule", false);
            }
            else resumeUpgradeData.scheduledTime = "Upgrade not scheduled";
            if(upgradeMonitorStatusProviderDetails && upgradeMonitorStatusProviderDetails.state) {
                api.setState("updateState", upgradeMonitorStatusProviderDetails.state);
            }
            resumeUpgradeData.targetPatch = responseData?.targetPatch;
            resumeUpgradeData.sys_id = responseData?.sys_id;
            resumeUpgradeData.activityLabel = `${responseData?.activeStepLabel} (${responseData?.activeStepCount}/${responseData?.totalSteps})`

            api.setState("resumeUpgradeData", resumeUpgradeData);
        }

        api.setState("playbookState", state);
        if(state === "PLAYBOOK_NOT_STARTED") showAvailableVersionCards();
        else if(state === "PLAYBOOK_IN_PROGRESS") showInProgressCard();
            
        api.setState("currentVersion", upgradeOverviewDetails?.currentVersion);
        api.setState("currentVersionZip", upgradeOverviewDetails?.currentVersionZip);
        api.setState("isProd", upgradeOverviewDetails?.environment);
        if(responseData?.upgradeDetails && responseData?.upgradeDetails?.upgradeOverviewDetails?.endOfLifeUrl?.toLowerCase()?.includes("kb")) api.setState("endOfLifeUrl", responseData?.upgradeDetails?.upgradeOverviewDetails?.endOfLifeUrl);
            
        const urlVersion = (upgradeOverviewDetails?.availableFamilyReleases && JSON.parse(upgradeOverviewDetails?.availableFamilyReleases)?.[0]?.split(" ")[0]?.toLowerCase()) || (upgradeOverviewDetails?.currentVersion?.split(" ")[0]?.toLowerCase()?.includes(".zip") ? "yokohama" : upgradeOverviewDetails?.currentVersion?.split(" ")[0]?.toLowerCase());
        if(!checkIfATFInstalled) api.setState("testGeneratorUrl", "now/nav/ui/classic/params/target/install_atf_test_generator.do");
    } catch(e) {
        console.log("Error executing UIB client script in upgrade management application: set upgrade details", e);
        api.setState("showServerError", true);
    }
}
