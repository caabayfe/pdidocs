// The engine barrel: the only import surface for adapters and facades.
export { createPlan, getPlan, getPlanByNumber, listPlans, listPlanChildren, updatePlan, executePlan, holdPlan, resumeSubPlan, reviewMilestone, acceptPlan, releasePlan, listPlanArtifacts, cancelPlan, deletePlan } from './plans.ts';
export { createWorkItem, getWorkItem, getWorkItemByNumber, listWorkItems, listWorkItemArtifacts, approve, execute, finish, accept, reopen, stop, cancel, updateWorkItem, previewRollback, rollback, deleteWorkItem } from './workItems.ts';
export { getDependencies, addDependency, removeDependency } from './dependencies.ts';
export { isCurrentRun, onReportOutcome } from './events.ts';
export { getConversationAnchor, readConversationActivity, readActivity } from './conversations.ts';
export { recordAtfTest, getTestManifest } from './atfTests.ts';
export { PlanNotFoundError, WorkItemNotFoundError, DependencyNotFoundError, InvalidStateError, ValidationError, BlockedPlanStateError, CascadeDepthExceededError, CheckpointRestoreError, DependentRunningError } from '../shared/errors.ts';
// states.ts lives under shared/ (not engine/) so glide/ can import it without
// routing through this barrel — re-exported here for consumers outside the engine.
export { STATE, stateName, stateValue } from '../shared/states.ts';
