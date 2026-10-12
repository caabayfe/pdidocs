import { newRecord } from './records.ts';
// Every attachment on a given table row, ordered by sys_created_on then sys_id so a
// tie between two attachments created in the same tick still sorts deterministically.
export function listAttachments(tableName, tableSysId) {
    const gr = newRecord('sys_attachment');
    gr.addQuery('table_name', tableName);
    gr.addQuery('table_sys_id', tableSysId);
    gr.orderBy('sys_created_on');
    gr.orderBy('sys_id');
    gr.query();
    const out = [];
    while (gr.next()) {
        const sys_id = gr.getUniqueValue();
        out.push({
            sys_id,
            display_name: String(gr.getValue('file_name') ?? ''),
            media_type: String(gr.getValue('content_type') ?? ''),
            locator: `/api/now/attachment/${sys_id}/file`,
            created_by: String(gr.getValue('sys_created_by') ?? ''),
            created_on: String(gr.getValue('sys_created_on') ?? '')
        });
    }
    return out;
}
// Delete every attachment on a given table row and answer how many went. Used by
// the delete cascade (domain/workItem.ts, domain/plan.ts): plans and work items
// both project their attachments as artifacts, so a deleted row that left its
// sys_attachment rows behind would leave them addressable through the attachment
// API forever with nothing left to reach them from.
//
// Ids are collected first and deleted through a fresh cursor each, rather than
// calling deleteRecord() on the positioned row of a live result set — the same
// get-then-delete shape domain/dependencies.ts's deleteEdge already uses, and it
// keeps the read cursor out of the way of the writes.
//
// Deleting a sys_attachment row is what the platform hangs its own chunk cleanup
// (sys_attachment_doc) off, so nothing else is enumerated here.
export function deleteAttachments(tableName, tableSysId) {
    const ids = [];
    const gr = newRecord('sys_attachment');
    gr.addQuery('table_name', tableName);
    gr.addQuery('table_sys_id', tableSysId);
    gr.query();
    while (gr.next())
        ids.push(String(gr.getUniqueValue()));
    let deleted = 0;
    for (const id of ids) {
        const row = newRecord('sys_attachment');
        if (!row.get(id))
            continue;
        if (!row.deleteRecord())
            throw new Error(`attachment delete failed: ${id}`);
        deleted++;
    }
    return deleted;
}
