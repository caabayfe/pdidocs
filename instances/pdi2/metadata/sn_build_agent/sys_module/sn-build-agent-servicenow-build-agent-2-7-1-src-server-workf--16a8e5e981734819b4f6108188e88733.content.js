import { classifyState } from '../shared/states.ts';
// A settled member no longer needs the machine (item parked/accepted, child
// plan accepted). A cancelled member is neither: out of the denominator, but it
// never satisfies anything. Items read the ONE shared classification.
function isSettledItem(s) {
    return classifyState(s) === 'settled';
}
export function proposePlanState(facts) {
    const { current, memberItemStates, childPlanStates, isSubPlan } = facts;
    // Terminals are absorbing; an empty plan is an authoring situation, not a
    // lifecycle event.
    if (current === 'completed' || current === 'cancelled')
        return null;
    const total = memberItemStates.length + childPlanStates.length;
    if (total === 0)
        return null;
    const cancelled = memberItemStates.filter(s => s === 'cancelled').length + childPlanStates.filter(s => s === 'cancelled').length;
    const settled = memberItemStates.filter(isSettledItem).length + childPlanStates.filter(s => s === 'completed').length;
    const unsettled = total - cancelled - settled;
    // Something still has work to do: an in_review plan regresses; others stay.
    if (unsettled > 0) {
        return current === 'in_review' ? { to: 'standby', standbyReason: 'regressed' } : null;
    }
    // Everything active settled, at least one survivor: reviewable. A SUB-plan
    // whose every active member is completed auto-completes — but only THROUGH
    // in_review (no shortcut edge; the binder applies proposals to a fixpoint).
    if (settled > 0) {
        const allCompleted = memberItemStates.every(s => s === 'completed' || s === 'cancelled') && childPlanStates.every(s => s === 'completed' || s === 'cancelled');
        if (isSubPlan && allCompleted && current === 'in_review')
            return { to: 'completed' };
        return current === 'in_review' ? null : { to: 'in_review' };
    }
    // Every member cancelled: close the execution gate without abandoning the
    // aggregate. Authoring can continue until the user explicitly cancels it.
    return current === 'standby' ? null : { to: 'standby', standbyReason: 'regressed' };
}
