/**
 * This script is used to update the state of the UI action
 * based on the state of the execution plans
 *
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
  const ACTIVE_STATES = new Set(['in_progress', 'required_input']);
  const UIACTION_TYPE = 'UIAction';
  const AI_TRIGGER_REGEX = /_(\w{32})/;
  const CURRENT_RUNS_SOURCE = 'ai_get_current_executions';
  const EXECUTION_PLAN_SOURCE = 'ai_execution_plan_watcher';
  const AI_ENABLED_SYS_PROP = 'com.glide.agentic_processes_view.enabled';

  const sysProps = api.state.systemProperties;
  const isAiEnabled = sysProps?.[AI_ENABLED_SYS_PROP] === 'true';

  if (!isAiEnabled) return;

  const normalizeState = state => state.toLowerCase().trim().replace(/\s+/g, '_');

  const gForm = api.data.glide_form_1;
  const formActions = gForm?.nowRecordCommonUiactionbar?.formActions;

  // Look through all of our form actions to see if any are possibly triggers
  // for AI Workflows
  const trigger2action = new Map();
  formActions?.forEach(({ uxActionType, id, name }) => {
    const isUiAction = uxActionType === UIACTION_TYPE;
    const triggerId = AI_TRIGGER_REGEX.exec(name)?.[1];
    if (isUiAction && triggerId) {
      trigger2action.set(triggerId, id);
    }
  });

  // If we don't have any UI Action which are candidates for AI Workflows, we can exit early
  if (!trigger2action.size) {
    return;
  }

  const { elementId: source, payload } = event;

  // From REST call
  if (source === CURRENT_RUNS_SOURCE) {
    const { current: workflowRuns } = payload.data.output.result;
    if (workflowRuns?.length) {
      // A specific workflow run can have multiple executions, but theoretically only one can
      // be in progress at a time. So we create a mapping of usecase to isActive, where isActive
      // is set to true if at least one of the execution runs is still in an ACTIVE_STATE
      const usecaseData = new Map();
      workflowRuns.forEach(({ aiTriggers, state, usecase }) => {
        const current = usecaseData.get(usecase) || {};
        const active = current.active || ACTIVE_STATES.has(normalizeState(state));
        const newAiTriggers = current.aiTriggers || new Set();
        aiTriggers.forEach(trigger => newAiTriggers.add(trigger));

        usecaseData.set(usecase, { active, aiTriggers: newAiTriggers });
      });

      // We do this after we've processed all of the runs because at this point we know
      // which usecases are active and which are not.
      usecaseData.forEach(({ active, aiTriggers }) => {
        aiTriggers.forEach(trigger => {
          const actionId = trigger2action.get(trigger);
          if (actionId) {
            gForm?.updateUiAction({ actionId, isDisabled: active });
          }
        });
      });
    }
    api.setState('currentRunsRequestInFlight', false);
  }
  // From sn_aia_execution_plan record watcher
  else if (source === EXECUTION_PLAN_SOURCE && !api.state.currentRunsRequestInFlight) {
    const {
      data: { changes = [] }
    } = payload;

    // We only care about state changes (which includes when a new execution plan is created)
    if (changes.includes('state')) {
      api.setState('currentRunsRequestInFlight', true);

      // The AMB changes don't contain the usecase that was completed/started
      // it only contains information on the execution plan. So we would
      // either have to query that information again (get usecase associated with execution plan),
      // or just call "Get Current AIA Execution Runs" again which gives us all the necessary info
      api.data.ai_get_current_executions.execute({
        recordTable: api.context.props.inputTable,
        recordSysId: api.context.props.inputSysId
      });
    }
  }
}
