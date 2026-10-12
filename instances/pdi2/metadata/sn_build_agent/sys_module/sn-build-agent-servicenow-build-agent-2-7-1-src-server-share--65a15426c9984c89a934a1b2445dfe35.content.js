// Typed errors thrown by engine functions so adapters can map them to HTTP status
// codes without sniffing error message strings.
export class PlanNotFoundError extends Error {
    constructor(id) {
        super(`plan not found: ${id}`);
        // ES5 transpilation resets the prototype on `super()`, breaking the
        // `instanceof`-driven adapter error mapping — pin the chain on every class.
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'PlanNotFoundError';
    }
}
export class WorkItemNotFoundError extends Error {
    constructor(id) {
        super(`work item not found: ${id}`);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'WorkItemNotFoundError';
    }
}
export class DependencyNotFoundError extends Error {
    constructor(id) {
        super(`dependency not found: ${id}`);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'DependencyNotFoundError';
    }
}
// A request violated a structural/domain rule; adapters map this to 400 validation_failed.
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'ValidationError';
    }
}
// A verb/edit was attempted from a state that forbids it; carries the record's
// current state for the 409 body. `state` is a readonly parameter property —
// deliberately not an assignment, so the single-writer lint leaves it alone.
export class InvalidStateError extends Error {
    state;
    constructor(message, state) {
        super(message);
        this.state = state;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'InvalidStateError';
    }
}
// execute from a legal item state but the plan switches are not both on; maps to
// 409 blocked_plan_state carrying both the item state and the ROOT plan's state.
export class BlockedPlanStateError extends Error {
    state;
    plan_state;
    constructor(message, state, plan_state) {
        super(message);
        this.state = state;
        this.plan_state = plan_state;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'BlockedPlanStateError';
    }
}
// The Checkpoint 0 restore failed; maps to 500 checkpoint_restore_failed. Only
// reopen surfaces it — rollback records it per-item in `failed[]`, cancel swallows it.
export class CheckpointRestoreError extends Error {
    workItemId;
    constructor(
    // Verbatim from CheckpointManager, never wrapped.
    message, workItemId) {
        super(message);
        this.workItemId = workItemId;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'CheckpointRestoreError';
    }
}
// reopen was attempted while a dependent work item is currently running against
// this item's about-to-be-backed-out output; carries the running dependents' ids
// so the adapter/client can point at them. Maps to 409 dependent_running.
export class DependentRunningError extends Error {
    dependentIds;
    constructor(message, dependentIds) {
        super(message);
        this.dependentIds = dependentIds;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'DependentRunningError';
    }
}
// rollback's blast radius exceeded the cascade depth without an explicit maxDepth
// confirmation; carries the attempted depth for the adapter.
export class CascadeDepthExceededError extends Error {
    maxDepth;
    constructor(message, maxDepth) {
        super(message);
        this.maxDepth = maxDepth;
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = 'CascadeDepthExceededError';
    }
}
