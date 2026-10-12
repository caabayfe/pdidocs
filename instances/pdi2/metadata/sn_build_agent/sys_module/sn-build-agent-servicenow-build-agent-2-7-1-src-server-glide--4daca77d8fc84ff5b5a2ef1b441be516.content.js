import { newRecord } from './records.ts';
function rowFrom(gr) {
    return {
        id: String(gr.getUniqueValue()),
        test_result_sys_id: String(gr.getValue('test_result') ?? ''),
        activity: String(gr.getValue('activity') ?? ''),
        test_output: String(gr.getValue('test_output') ?? '') || null,
        report: String(gr.getValue('agent_report') ?? '') || null,
        created: String(gr.getValue('sys_created_on') ?? ''),
        updated: String(gr.getValue('sys_updated_on') ?? '')
    };
}
// Test tracking CRUD
export function insertAtfTest(row) {
    const gr = newRecord('sn_build_agent_atf_test');
    gr.initialize();
    gr.setValue('test_result', row.test_result_sys_id);
    gr.setValue('activity', row.activity);
    if (row.test_output) {
        gr.setValue('test_output', row.test_output);
    }
    if (row.report) {
        gr.setValue('agent_report', row.report);
    }
    const id = gr.insert();
    return id ? rowFrom(gr) : null;
}
export function getAtfTestsByActivity(activityId) {
    const gr = newRecord('sn_build_agent_atf_test');
    gr.addQuery('activity', activityId);
    gr.query();
    const out = [];
    while (gr.next()) {
        out.push(rowFrom(gr));
    }
    return out;
}
export function getAtfTestsByWorkItem(workItemId) {
    const gr = newRecord('sn_build_agent_atf_test');
    gr.addQuery('activity.work_item', workItemId);
    gr.query();
    const out = [];
    while (gr.next()) {
        out.push(rowFrom(gr));
    }
    return out;
}
export function getAtfTestByResultSysId(resultSysId) {
    const gr = newRecord('sn_build_agent_atf_test');
    gr.addQuery('test_result', resultSysId);
    gr.query();
    return gr.next() ? rowFrom(gr) : null;
}
// ATF result queries (read-only from sys_atf_test_result)
export function getTestResultById(resultSysId) {
    const gr = newRecord('sys_atf_test_result');
    if (!gr.get(resultSysId))
        return null;
    return {
        sys_id: String(gr.getUniqueValue()),
        test: String(gr.getValue('test') ?? ''),
        status: String(gr.getValue('status') ?? ''),
        run_time: String(gr.getValue('run_time') ?? ''),
        output: String(gr.getValue('output') ?? '')
    };
}
// Get test name from sys_atf_test
export function getTestName(testSysId) {
    const gr = newRecord('sys_atf_test');
    if (!gr.get(testSysId))
        return null;
    return String(gr.getValue('name') ?? '') || null;
}
export function getLatestResultByAtfTest(atfTestSysId) {
    const gr = newRecord('sys_atf_test_result');
    gr.addQuery('test', atfTestSysId);
    gr.orderByDesc('run_time');
    gr.setLimit(1);
    gr.query();
    if (!gr.next())
        return null;
    return {
        sys_id: String(gr.getUniqueValue()),
        test: String(gr.getValue('test') ?? ''),
        status: String(gr.getValue('status') ?? ''),
        run_time: String(gr.getValue('run_time') ?? ''),
        output: String(gr.getValue('output') ?? '')
    };
}
// Get first failed step for a test result
export function getFirstFailedStep(resultSysId) {
    const gr = newRecord('sys_atf_test_result_step');
    gr.addQuery('result', resultSysId);
    gr.addQuery('status', 'failure');
    gr.orderBy('order');
    gr.setLimit(1);
    gr.query();
    if (!gr.next())
        return null;
    return {
        step_display_name: String(gr.getDisplayValue('step') ?? ''),
        output: String(gr.getValue('output') ?? '')
    };
}
// Hash computation helper
export function computeWorkItemContentHash(workItem) {
    const content = [workItem.description || '', workItem.acceptance_criteria || ''].join('|');
    const digest = new GlideDigest();
    return digest.getSHA256Hex(content);
}
