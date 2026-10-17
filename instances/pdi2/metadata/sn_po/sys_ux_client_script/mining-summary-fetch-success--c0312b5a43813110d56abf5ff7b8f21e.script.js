/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    // Import formatting of numbers
    const {
        formatNumber
    } = imports["global.prominUtils"]();

    const computeEntitlementNumbers = function({
      totalEntitlement,
      usedRecords,
      projectRecordCount,
      cropOrTransitionConditionSet
      }) {
      const baseUsageAvailable = totalEntitlement - usedRecords;
      const effectiveEntitlement = cropOrTransitionConditionSet ? totalEntitlement * 5 : totalEntitlement;
      const usageAvailable = effectiveEntitlement - usedRecords;
      const recordsWithinEntitlementRaw = Math.max(0, Math.min(projectRecordCount, usageAvailable));
      const recordsExceedingEntitlementRaw = projectRecordCount - recordsWithinEntitlementRaw;
      const denominator = recordsExceedingEntitlementRaw + recordsWithinEntitlementRaw;
      const recordsWithinPercentage = denominator > 0 ? (recordsWithinEntitlementRaw / denominator) * 100 : 0;

      return {
        baseUsageAvailable,
        usageAvailable,
        hasOverage: recordsExceedingEntitlementRaw > 0,
        recordsWithinEntitlement: formatNumber(recordsWithinEntitlementRaw, { full: true }),
        recordsExceedingEntitlement: formatNumber(recordsExceedingEntitlementRaw, { full: true }),
        recordsWithinPercentage,
        cropOrTransitionConditionSet,
        usedCredits: formatNumber(usedRecords, { full: true }),
      };
    }

    let miningTime;
    let miningSummary = event.payload.data.output.data.GlidePromin_Query.miningSummary;

    if (miningSummary.startTime && miningSummary.completionTime) {
        let startTime = new Date(miningSummary.startTime);
        let completionTime = new Date(miningSummary.completionTime);
        let miningDuration = Math.abs(completionTime.valueOf() - startTime.valueOf());
        let days = miningDuration / (24 * 60 * 60 * 1000);
        let hours = (days % 1) * 24;
        let minutes = (hours % 1) * 60;
        let secs = (minutes % 1) * 60;
        [days, hours, minutes, secs] = [Math.floor(days), Math.floor(hours), Math.floor(minutes), Math.floor(secs)];
        if (hours > 0) {
            miningTime = `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            miningTime = `${minutes}m ${secs}s`;
        } else if (secs >= 0) {
            miningTime = `${secs}s`;
        }
    }

    let findingSummaryStatusMap = miningSummary?.findingSummary.reduce((accumulator, item) => ({
        ...accumulator,
        [(item.status || '').toLowerCase()]: item,
    }), {});

    const successRuleFindingIds = findingSummaryStatusMap?.success.ruleFindingDefIds || [];
    const successAutoFindingIds = findingSummaryStatusMap?.success.automatedFindingDefIds || [];
    const successCountRule = successRuleFindingIds.length;
    const successCountAuto = successAutoFindingIds.length;
    const successCount = successCountRule + successCountAuto;

    const outOfScopeRuleFindingIds = findingSummaryStatusMap?.out_of_scope.ruleFindingDefIds || [];
    const outOfScopeAutoFindingIds = findingSummaryStatusMap?.out_of_scope.automatedFindingDefIds || [];
    const outOfScopeCountRule = outOfScopeRuleFindingIds.length;
    const outOfScopeCountAuto = outOfScopeAutoFindingIds.length;
    const outOfScopeCount = outOfScopeCountRule + outOfScopeCountAuto;

    const warningRuleFindingIds = findingSummaryStatusMap?.warning.ruleFindingDefIds || [];
    const warningAutoFindingIds = findingSummaryStatusMap?.warning.automatedFindingDefIds || [];
    const warningRecordsCountRule = warningRuleFindingIds.length;
    const warningRecordsCountAuto = warningAutoFindingIds.length;
    const warningRecordsCount = warningRecordsCountRule + warningRecordsCountAuto;

    const noMatchingRuleFindingIds = findingSummaryStatusMap?.no_matches.ruleFindingDefIds || [];
    const noMatchingAutoFindingIds = findingSummaryStatusMap?.no_matches.automatedFindingDefIds || [];
    const noMatchingRecordsCountRule = noMatchingRuleFindingIds.length;
    const noMatchingRecordsCountAuto = noMatchingAutoFindingIds.length;
    const noMatchingRecordsCount = noMatchingRecordsCountRule + noMatchingRecordsCountAuto;

    const successLinkRule = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(successRuleFindingIds.join(','))}`;
    const successLinkAuto = `/promin_automated_finding_list.do?sysparm_query=sys_idIN${encodeURIComponent(successAutoFindingIds.join(','))}`;
    const emptyLinkRule = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(outOfScopeRuleFindingIds.join(','))}`;
    const emptyLinkAuto = `/promin_automated_finding_list.do?sysparm_query=sys_idIN${encodeURIComponent(outOfScopeAutoFindingIds.join(','))}`;
    const warningLinkRule = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(warningRuleFindingIds.join(','))}`;
    const warningLinkAuto = `/promin_automated_finding_list.do?sysparm_query=sys_idIN${encodeURIComponent(warningAutoFindingIds.join(','))}`;
    const noMatchingLinkRule = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(noMatchingRuleFindingIds.join(','))}`;
    const noMatchingLinkAuto = `/promin_automated_finding_list.do?sysparm_query=sys_idIN${encodeURIComponent(noMatchingAutoFindingIds.join(','))}`;

   if(miningSummary.errorContext) {
      const rootEntity = api.state.projectData.projectEntities?.find(item => !item.parentId) || {};
      const entitlementNumbers = computeEntitlementNumbers({...miningSummary.errorContext, cropOrTransitionConditionSet: Boolean(rootEntity?.hasCropOrTransition)});
      miningSummary = {...miningSummary, errorContext: {...miningSummary.errorContext, entitlementNumbers}};
   }

    api.setState('projectData', {
        ...api.state.projectData,
        miningState: api.state.miningState,
        ismining: false,
        isRemining: false,
        showSummary: true,
        miningSummary: {
            ...miningSummary,
            miningTime,
        },
        findingSummaryStatusMap: {
            ...findingSummaryStatusMap,
            successCount,
            successCountRule,
            successCountAuto,
            outOfScopeCount,
            outOfScopeCountRule,
            outOfScopeCountAuto,
            warningRecordsCount,
            warningRecordsCountRule,
            warningRecordsCountAuto,
            noMatchingRecordsCount,
            noMatchingRecordsCountRule,
            noMatchingRecordsCountAuto,
            successLinkRule,
            successLinkAuto,
            warningLinkRule,
            warningLinkAuto,
            emptyLinkRule,
            emptyLinkAuto,
            noMatchingLinkRule,
            noMatchingLinkAuto
        }
    });

    if (api.state.hasCapacityBasedLicense) {
        if (api.state.entitlementCheckInProgress && !miningSummary.errorContext && api.state.miningType === 'FULL') {
            helpers.modal.close("[component-id$='entitlement_check_modal']");
            helpers.modal.open("[component-id$='mining_summary']");
        }
        api.setState('entitlementCheckInProgress', false);
    }
    if (api.state.projectData.miningState.value == 'ERROR') {
        api.data.get_current_project.refresh();
    }
}
