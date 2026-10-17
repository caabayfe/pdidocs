
			
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
    var wrapUpControllerProperties = ['interactionSysId', 'interactionType', 'interactionState', 'interactionAssignedTo', 'interactionActive', 'isThirdPartyEnabled'];
    var isThirdPartyDisabled = api.context.props.isThirdPartyEnabled === undefined || api.context.props.isThirdPartyEnabled === false;
    var modal = "[component-id$='wrap_up_close_tab_modal']";
    if (event.eventInfo) {
        var id = event.eventInfo.sourceElementId;
        var baseId = '';
        if (id) {
            var arr = id.split('-', 2);
            baseId = arr[0];
        }
        modal = "[component-id$='" + baseId + "-wrap_up_close_tab_modal']";
    }
    if ((event.name == 'MACROPONENT_READY' || (event.name == 'MACROPONENT_PROPERTY_CHANGED' && wrapUpControllerProperties.includes(event.payload.name))) && isThirdPartyDisabled == true) {
        const wipCloseTabHeaderText = await helpers.translate("Close Tab");
        const wipCloseTabMessage = await helpers.translate("Are you sure you want to close the record tab? This will end the chat and close the interaction.");
        var hasWarning = false;
        var contextProps = api.context.props;
        var interactionType = contextProps.interactionType;
        var interactionState = contextProps.interactionState;
        var interactionAssignedTo = contextProps.interactionAssignedTo;
        var interactionActive = contextProps.interactionActive;

        if (interactionAssignedTo === api.context.session.user.sys_id && interactionActive &&
            ((interactionType === 'chat') || (interactionType === 'messaging' && interactionState === 'wrap_up') || (interactionType === 'phone' && interactionState === 'wrap_up') || (interactionType === 'email' && interactionState === 'wrap_up'))) {
            api.setState("closeTabHeader", wipCloseTabHeaderText);
            api.setState("closeTabMessage", wipCloseTabMessage);
            hasWarning = true;
        }

        api.emit('SCREEN_STATUS_CHANGED', {
            hasWarning: hasWarning,
            warningModalId: modal
        });
    } else {
        var isWrapUpSubmitted = api.state.isWrapUpSubmitted;
        if (isWrapUpSubmitted === true || (isThirdPartyDisabled === false && api.state.isOpenWrapUpForCurrentUser === true)) {
            api.emit('SCREEN_STATUS_CHANGED', {
                hasWarning: !isWrapUpSubmitted === true,
                warningModalId: modal
            });
        }
        const codesNotEnabledMessage = await helpers.translate("Are you sure you want to close the record tab? This will end the wrap up period.");
        const codesEnabledMessage = await helpers.translate("Are you sure you want to close the record tab? This will end the wrap up period and the default wrap up code will be submitted.");
        const wrapUpCloseTabHeaderText = await helpers.translate("Close tab without completing wrap up?");
        const noSegmentAndConfigurationMessage = await helpers.translate("API Failure - Cannot get segment and configuration details which are needed for wrap up. Please contact your support team or system admin.");

        // Only the segment broker's DATA_OP_SUCCEEDED carries this payload. Bail on
        // other events (property changes, config-broker fires) to avoid the false
        // API-failure popup below.
        const segmentByAgentAndInteraction = event?.payload?.data?.output?.data?.now?.wrapUpSegment?.segmentByAgentAndInteraction;
        if (!segmentByAgentAndInteraction) {
            return;
        }

        const success = segmentByAgentAndInteraction.success;
        const segment = segmentByAgentAndInteraction.segment;

        if (!success || !segment) {
            api.emit("WRAP_UP#ADD_NOTIFICATION", {
                message: noSegmentAndConfigurationMessage,
            });
            return;
        }

        // Snapshot whether wrap-up was already open before this fire. The segment broker
        // re-fires on every segment record change, including the config-update path. The
        // timer-creation block below must only run for the "initiate or continue" entry
        // (initial wrap-up or page refresh) so we don't race with Update Wrap Up Timer,
        // which owns the timer on config updates.
        const wasAlreadyOpen = api.state.isOpenWrapUpForCurrentUser === true;

        api.setState("wrapUpSegmentSysId", segment.sys_id);

        api.setState("segmentJson", segment);
        api.setState("segmentId", segment.sys_id);
        api.setState("isOpenWrapUpForCurrentUser", true);

        const wrapUpConfig = segment.wrap_up_configuration;
        var allowedCodes = wrapUpConfig.allowed_codes;
        var allowedCodesArray = [];
        for (let i = 0; i < allowedCodes.length; i++) {
            allowedCodesArray.push({
                id: "allowed_code_" + i + (segment.ai_wrap_up_code!=null ? wrapUpConfig.allowed_codes[i].code : ""),
                label: wrapUpConfig.allowed_codes[i].code
            });
        }
        
        var sectionalAllowedCodes = [];
        if (segment.ai_wrap_up_code) {
            sectionalAllowedCodes.push({
                id:"0",
                label:"AI Recommendation",
                children:[{
                    id: "ai_rec",
                    label: segment.ai_wrap_up_code?.code
                }]
            });
            
            sectionalAllowedCodes.push({
                id:"1",
                label:"All available codes",
                children:allowedCodesArray
            });
            
            api.setState("allowedWrapUpCodes", sectionalAllowedCodes);
        } else {
            api.setState("allowedWrapUpCodes", allowedCodesArray);
        }

        var isCodesEnabled = wrapUpConfig.enable_codes;
        var isTimerEnabled = wrapUpConfig.enforce_duration;
        api.setState("closeTabHeader", wrapUpCloseTabHeaderText);
        if (!isCodesEnabled) {
            api.setState("closeTabMessage", codesNotEnabledMessage);
        } else {
            api.setState("closeTabMessage", codesEnabledMessage);
        }
        const wrapUpConfigSysId = wrapUpConfig.sys_id;

        api.setState("defaultWrapUpCode", wrapUpConfig.default_code);
        api.setState("enabledCodes", wrapUpConfig.enable_codes);
        api.setState("isAICodeEnabled", wrapUpConfig.enable_ai_code);
        api.setState("isAINotesEnabled",wrapUpConfig.enable_ai_notes);
        api.setState("isThirdPartyAIEnabled", wrapUpConfig.use_third_party_ai);
        api.setState("useAIAsDefaultCode",wrapUpConfig.use_ai_code_as_default);
        api.setState("predictedAINotes", segment.ai_notes);
        api.setState("predictedAICode", segment.ai_wrap_up_code);
        api.setState("wrapUpConfigSysId", wrapUpConfigSysId);
        api.setState("wrapUpConfigSnapshot", wrapUpConfigSysId + "|" + wrapUpConfig.duration + "|" + wrapUpConfig.enforce_duration + "|" + wrapUpConfig.show_timer);
        

        api.setState("timerEnabled", isTimerEnabled);

        // Only run the timer-creation block on the initiate/continue path. Skip on
        // re-fires (config updates) — Update Wrap Up Timer owns timer restart for those
        // and uses a now-anchor to honor the new duration as a fresh countdown.
        if (isTimerEnabled && !wasAlreadyOpen) {
            const existingTimer = api.state.timer;
            if (existingTimer) {
                helpers.timing.clearInterval(existingTimer);
                api.setState('timer', null);
            }
            api.setState("showTimer", wrapUpConfig.show_timer);
            api.setState("timerDuration", wrapUpConfig.duration);

            const secondToTimeFormat = sec_num => {
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                return hours + ':' + minutes + ':' + seconds;
            };

            const timerColors = ['high', 'warning', 'positive', 'positive'];

            // Anchor to segment.refreshed_on — set to opened_on on segment create, and
            // updated to now() on each CCaaS config-only refresh. The dash-to-slash
            // replace is for Safari date parsing (DEF0679821).
            const timerStartedAt = new Date((segment.refreshed_on || segment.opened_on).replace(/-/g, "/") + " UTC").getTime();
            const timerDurationMs = wrapUpConfig.duration * 1000;

            let timer;
            const tick = () => {
                const currentMs = new Date().getTime();
                const timeLeft = Math.ceil((timerStartedAt + timerDurationMs - currentMs) / 1000);
                api.setState('timeLeftInSecond', timeLeft);
                if (timeLeft <= 0) {
                    if (timer)
                        helpers.timing.clearInterval(timer);
                    api.emit('WRAP_UP#END_WRAP_UP', {});
                    return;
                }
                const currentColorIndex = Math.floor(timeLeft * 1000 / timerDurationMs * timerColors.length);
                api.setState('timerLabel', secondToTimeFormat(timeLeft));
                api.setState('timerColor', timerColors[currentColorIndex]);
            };
            tick();
            timer = helpers.timing.setInterval(tick, 1000);

            api.setState('timer', timer);

        }
    }
}
