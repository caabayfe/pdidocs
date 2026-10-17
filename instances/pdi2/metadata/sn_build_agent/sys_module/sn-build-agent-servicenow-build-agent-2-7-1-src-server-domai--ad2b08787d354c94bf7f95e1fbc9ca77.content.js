import * as records from '../glide/records.ts';
import { PlanNotFoundError, ValidationError, WorkItemNotFoundError } from '../shared/errors.ts';
const PLAN_TABLE = 'sn_build_agent_plan';
const WORK_ITEM_TABLE = 'sn_build_agent_work_item';
function text(value) {
    return typeof value === 'string' ? value.trim() : '';
}
function inputLabel(input) {
    if (!input || typeof input !== 'object')
        return String(input ?? '');
    const candidate = input;
    return text(candidate.number) || text(candidate.sys_id);
}
function requireReferenceInput(input, kind) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new ValidationError(`${kind} must be an object containing sys_id, number, or both`);
    }
    const candidate = input;
    const sys_id = text(candidate.sys_id);
    const number = text(candidate.number);
    if (!sys_id && !number)
        throw new ValidationError(`${kind} requires sys_id, number, or both`);
    return { ...(sys_id && { sys_id }), ...(number && { number }) };
}
function bySysId(table, sysId) {
    const gr = records.newRecord(table);
    return gr.get('sys_id', sysId) ? gr : null;
}
function byUniqueNumber(table, number, kind) {
    const query = records.newRecord(table);
    query.addQuery('number', number);
    query.setLimit(2);
    query.query();
    if (!query.next())
        return null;
    const sysId = String(query.getUniqueValue());
    if (query.next())
        throw new ValidationError(`${kind} number is ambiguous: ${number}`);
    return bySysId(table, sysId);
}
function resolveReference(table, input, kind, notFound) {
    const reference = requireReferenceInput(input, kind);
    const byId = reference.sys_id ? bySysId(table, reference.sys_id) : null;
    if (reference.sys_id && !byId)
        throw notFound(inputLabel(reference));
    const byNumber = reference.number ? byUniqueNumber(table, reference.number, kind) : null;
    if (reference.number && !byNumber)
        throw notFound(inputLabel(reference));
    if (byId && byNumber && String(byId.getUniqueValue()) !== String(byNumber.getUniqueValue())) {
        throw new ValidationError(`${kind} sys_id and number identify different records`);
    }
    const record = byId || byNumber;
    if (!record)
        throw notFound(inputLabel(reference));
    return {
        sys_id: String(record.getUniqueValue()),
        number: String(record.getValue('number') ?? '')
    };
}
export function resolvePlanReference(input) {
    return resolveReference(PLAN_TABLE, input, 'plan', value => new PlanNotFoundError(value));
}
export function planReferenceFromSysId(sysId) {
    return resolvePlanReference({ sys_id: sysId });
}
export function resolveWorkItemReference(input) {
    return resolveReference(WORK_ITEM_TABLE, input, 'work_item', value => new WorkItemNotFoundError(value));
}
export function workItemReferenceFromSysId(sysId) {
    return resolveWorkItemReference({ sys_id: sysId });
}
