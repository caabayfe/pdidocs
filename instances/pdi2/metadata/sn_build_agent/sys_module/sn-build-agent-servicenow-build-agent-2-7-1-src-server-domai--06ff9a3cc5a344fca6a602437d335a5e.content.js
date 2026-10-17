// src/server/domain/instructions.ts
// Loads custom skills and rules for the non-interactive work-item dispatch path.
// This mirrors the REST API routes (skillsSummaryRoute, skillDetailRoute,
// rulesRoute) but runs in-process via the records seam rather than a loopback
// HTTP call, so the dispatch collaborator can resolve instructions without the
// REST API's session context.
//
// GlideRecord vs GlideRecordSecure: the REST routes run in the interactive
// user's session and use GlideRecordSecure for ACL enforcement. This dispatch
// path runs as system (no interactive session), and intentionally uses
// GlideRecord. Instance-level instructions (applies_to='instance') are
// instance-wide by design — there are no row-level ACLs that would restrict
// which users may read them. User-scoped instructions are filtered by
// `user = principal`, so the query itself provides data isolation.
//
// Application-scoped instructions (applies_to='application') are intentionally
// skipped: dispatched work items have no active application scope context.
import { gs } from '@servicenow/glide';
import * as records from '../glide/records.ts';
const METADATA_TABLE = 'sn_build_agent_instruction';
const USER_TABLE = 'sn_build_agent_user_instruction';
// Kill switch: default on, but lets an instance turn off instance/user skill
// and rule loading for dispatched runs without a code change — e.g. if the
// feature misbehaves, or the customer doesn't want dispatched runs to pick up
// custom instructions at all.
function dispatchInstructionsEnabled() {
    return gs.getProperty('sn_build_agent.instruction.dispatch_enabled', 'true') === 'true';
}
// Rank constants mirror the REST routes: instance=0, user=2.
// Application (rank=1) is skipped — see module header.
const RANK_INSTANCE = 0;
const RANK_USER = 2;
// Safety ceiling: the instruction tables are gated by write-time active_limit
// properties (50 skills, 5 rules per bucket), but we add a query-time limit as
// a defence-in-depth measure against unbounded cursor cost on any single query.
// 100 per query is generous (two buckets × 50 skills = 100 max) and harmless
// when tables are smaller.
const QUERY_LIMIT = 100;
/** Load skills and rules for a dispatched work-item run. */
export function loadInstructionsForDispatch(principal) {
    if (!dispatchInstructionsEnabled())
        return { skills: [], rules: [] };
    return {
        skills: loadSkills(principal),
        rules: loadRules(principal)
    };
}
// ---------------------------------------------------------------------------
// Skills: deduplicated by name, higher rank wins (user overrides instance).
// ---------------------------------------------------------------------------
function loadSkills(principal) {
    const entries = new Map();
    // Instance-level skills (rank 0).
    const metaGr = records.newRecord(METADATA_TABLE);
    metaGr.addQuery('active', true);
    metaGr.addQuery('type', 'skill');
    metaGr.addQuery('applies_to', 'instance');
    metaGr.setLimit(QUERY_LIMIT);
    metaGr.orderBy('name');
    metaGr.query();
    while (metaGr.next()) {
        mergeSkill(metaGr, RANK_INSTANCE, entries);
    }
    // User-level skills (rank 2) — override instance by name.
    const userGr = records.newRecord(USER_TABLE);
    userGr.addQuery('active', true);
    userGr.addQuery('type', 'skill');
    userGr.addQuery('user', principal);
    userGr.setLimit(QUERY_LIMIT);
    userGr.orderBy('name');
    userGr.query();
    while (userGr.next()) {
        mergeSkill(userGr, RANK_USER, entries);
    }
    // Sort by rank descending (most specific first), then alphabetically.
    const sorted = Array.from(entries.values());
    sorted.sort((a, b) => {
        if (a.rank !== b.rank)
            return b.rank - a.rank;
        return a.skill.name < b.skill.name ? -1 : a.skill.name > b.skill.name ? 1 : 0;
    });
    return sorted.map(e => e.skill);
}
function mergeSkill(gr, rank, entries) {
    const name = String(gr.getValue('name') ?? '');
    const existing = entries.get(name);
    if (existing && existing.rank > rank)
        return; // existing higher-rank wins
    entries.set(name, {
        skill: {
            name,
            description: String(gr.getValue('description') ?? ''),
            body: String(gr.getValue('body') ?? '')
        },
        rank
    });
}
// ---------------------------------------------------------------------------
// Rules: collected (not deduplicated), sorted instance -> user, then by name.
// ---------------------------------------------------------------------------
function loadRules(principal) {
    const rules = [];
    // Instance-level rules (rank 0).
    const metaGr = records.newRecord(METADATA_TABLE);
    metaGr.addQuery('active', true);
    metaGr.addQuery('type', 'rule');
    metaGr.addQuery('applies_to', 'instance');
    metaGr.setLimit(QUERY_LIMIT);
    metaGr.orderBy('name');
    metaGr.query();
    while (metaGr.next()) {
        rules.push(ruleFromCursor(metaGr, RANK_INSTANCE));
    }
    // User-level rules (rank 2).
    const userGr = records.newRecord(USER_TABLE);
    userGr.addQuery('active', true);
    userGr.addQuery('type', 'rule');
    userGr.addQuery('user', principal);
    userGr.setLimit(QUERY_LIMIT);
    userGr.orderBy('name');
    userGr.query();
    while (userGr.next()) {
        rules.push(ruleFromCursor(userGr, RANK_USER));
    }
    // Governance order: instance first, then user; alphabetical within each rank.
    rules.sort((a, b) => {
        if (a._rank !== b._rank)
            return a._rank - b._rank;
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    return rules.map(({ _rank: _, ...rule }) => rule);
}
function ruleFromCursor(gr, rank) {
    const name = String(gr.getValue('name') ?? '');
    const description = String(gr.getValue('description') ?? '') || undefined;
    const body = String(gr.getValue('body') ?? '');
    return { _rank: rank, name, description, body };
}
