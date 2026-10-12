// src/server/engine/atfTests.ts
// Business logic layer for ATF test tracking. Handles test creation, invalidation,
// and deletion lifecycle. Mirrors the conversations.ts pattern.
import * as atfTests from '../glide/atfTests.ts';
import * as activity from '../glide/activity.ts';
import { WorkItem } from '../domain/workItem.ts';
import { workItemReferenceFromSysId } from '../domain/recordReferences.ts';
function activityDto(row) {
    if (!row)
        return null;
    return {
        sys_id: row.id,
        conversation: row.conversation || null,
        kind: row.kind,
        outcome: row.outcome || null,
        summary: row.summary,
        plan: { sys_id: row.plan, number: '' }, // Minimal reference
        work_item: row.work_item ? workItemReferenceFromSysId(row.work_item) : null,
        prior_activity: row.prior_activity || null,
        created: row.created
    };
}
function atfTestDto(row, workItem) {
    const activityRow = activity.getActivityById(row.activity);
    return {
        sys_id: row.id,
        work_item: workItem,
        test_result_sys_id: row.test_result_sys_id,
        activity: activityDto(activityRow),
        test_output: row.test_output,
        report: row.report,
        created: row.created
    };
}
export function recordAtfTest(workItemId, input) {
    // Load work item
    const workItem = WorkItem.load(workItemId);
    // Get newest run activity
    const activityRow = activity.getNewestRunActivity(workItemId);
    if (!activityRow) {
        throw new Error('No run activity found for work item');
    }
    // Create tracking record
    const row = atfTests.insertAtfTest({
        test_result_sys_id: input.test_result_sys_id,
        activity: activityRow.id,
        test_output: input.test_output,
        report: input.report
    });
    if (!row) {
        throw new Error('Failed to create ATF test tracking record');
    }
    return atfTestDto(row, workItemReferenceFromSysId(workItemId));
}
export function getTestManifest(workItemId) {
    // Get all tests for this work item
    const allTests = atfTests.getAtfTestsByWorkItem(workItemId);
    // Build test manifest
    const tests = allTests.map(test => {
        // Get the test result record
        const result = atfTests.getTestResultById(test.test_result_sys_id);
        // Check if test/result was deleted
        const deleted = !result;
        // Get test name from sys_atf_test (if test still exists)
        const testSysId = result?.test || '';
        const testName = testSysId ? atfTests.getTestName(testSysId) : null;
        let failed_step = null;
        let failure_summary = null;
        // If test failed, get failure details
        if (result && (result.status === 'failure' || result.status === 'error')) {
            const failedStepRow = atfTests.getFirstFailedStep(result.sys_id);
            if (failedStepRow) {
                failed_step = failedStepRow.step_display_name || null;
                failure_summary = failedStepRow.output || 'Step failed';
            }
            else {
                failure_summary = result.output || 'Test failed';
            }
        }
        return {
            test_sys_id: testSysId,
            test_name: testName || testSysId || 'Unknown Test',
            test_result_sys_id: test.test_result_sys_id,
            last_run_at: result?.run_time || null,
            status: result ? mapAtfStatus(result.status) : null,
            failed_step,
            failure_summary,
            test_output: test.test_output,
            report: test.report,
            deleted
        };
    });
    return { tests };
}
// Map ATF status to our simplified status
function mapAtfStatus(atfStatus) {
    if (atfStatus === 'success')
        return 'passed';
    if (atfStatus === 'failure' || atfStatus === 'error')
        return 'failed';
    return 'pending';
}
