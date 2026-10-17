// src/server/glide/records.ts
// The ONE GlideRecord/GlideAggregate construction site for the server. Every entity
// and collaborator obtains its cursor here; nothing else under src/server (the
// domain, the engine verbs that delegate to it, and glide/activity.ts, whose rows
// are written on the dispatch path) calls `new GlideRecord(...)` directly. Any new
// row-touching module joins this list rather than importing the runtime itself —
// a module that constructs its own cursor drops out of the fake below and silently
// pulls the '@servicenow/glide' runtime into whatever test reaches it.
// This seam keeps a future GlideRecordSecure migration local: swapping the two
// constructors below requires no method signature changes,
// because the entities use only the shared cursor surface (get/addQuery/query/
// next/getValue/getUniqueValue/setValue/insert/update/deleteRecord) and the journal
// reader below. None of it is GlideRecordSecure-specific.
//
// Tests substitute an in-memory fake via `jest.mock('./records')` (see
// __mocks__/records.ts), so the '@servicenow/glide' server runtime is never
// loaded under jest — the same guarantee the retired glide/gateways mock gave.
import { GlideRecord, GlideAggregate } from '@servicenow/glide';
export const newRecord = (table) => new GlideRecord(table);
export const newAggregate = (table) => new GlideAggregate(table);
// Journal entries live in sys_journal_field, so GlideRecord.getValue() does not
// return their persisted history. Keep the platform-specific GlideElement call at
// this seam with the record constructors.
export function getJournalEntries(record, field) {
    return String(record.getElement(field).getJournalEntry(-1) ?? '');
}
