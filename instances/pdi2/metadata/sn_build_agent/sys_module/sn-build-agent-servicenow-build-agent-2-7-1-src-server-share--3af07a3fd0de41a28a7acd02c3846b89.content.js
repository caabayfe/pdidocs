// src/server/shared/label.ts
// The ONE place a plan or work item becomes human-facing text.
//
// Every sentence the engine writes for a person — a conversation title, a halt
// summary in the red alert — used to interpolate a raw 32-character sys_id. The
// number is the product's own language for these records (the Builder types "tell
// me about the errors in WI0007"), so it belongs everywhere the id was.
//
// The sys_id fallback is not defensive padding, it is the documented contract: rows
// created before the `number` column shipped carry '' and are deliberately NOT
// backfilled, and the fake-DB test harness applies no dictionary defaults. An id is a
// worse label than a number but an infinitely better one than an empty string.
export const label = (r) => r.number || r.sys_id;
