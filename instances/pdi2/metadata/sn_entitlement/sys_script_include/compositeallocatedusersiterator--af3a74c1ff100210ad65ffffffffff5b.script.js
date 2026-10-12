var CompositeAllocatedUsersIterator = Class.create();
/**
 * Create a composite iterator of two iterators
 * 
 * it1 and it2 can be dao_ConfirmedUsersIterator or dao_UnconfirmedUsersIterator iterators.
 * 
 * Usage var it = CompositeAllocatedUsersIterator.create(it1, it2);
 * while(it.hasNext()) {
 *   it.next();
 *   var isConfirmed = it.isConfirmed();
 *   var federatedId = it.getFederatedId();
 * }
 * 
 * You can combine any number of iterators, for example,
 * CompositeAllocatedUsersIterator.create(
 *   CompositeAllocatedUsersIterator.create(it1, it2),
 *   CompositeAllocatedUsersIterator.create(it3, it4)
 * );
 */
CompositeAllocatedUsersIterator.prototype = {
    /**
     * 
     * @param {dao_AllocatedUsersIterator} it1 first iterator
     * @param {dao_AllocatedUsersIterator} it2 second iterator
     */
    initialize: function(it1, it2) {
        this._it1 = it1;
        this._it2 = it2;
        this._current = this._it1;
    },

    /**
     * Iterator hasNext()
     * @returns boolean true if any of the iterator.hasNext() is true, otherwise false
     */
    hasNext: function() {
        if (!this._current.hasNext())
            this._current = this._it2;

        return this._current.hasNext();
    },

    /**
     * Moves the iterator to next() if any of the iterators has next
     */
    next: function() {
        if (this.hasNext())
            return this._current.next();
        
        return null;
    },

    /**
     * 
     * @returns boolean is user confirmed (allocated) or unconfirmed (unallocated)?
     */
    isConfirmed: function() {
        return this._current.isConfirmed();
    },

    /**
     * 
     * @returns fedrated-id of the user
     */
    getFederatedId: function() {
        return this._current.getFederatedId();
    },

    type: 'CompositeAllocatedUsersIterator'
};

/**
 * 
 * @param {dao_AllocatedUsersIterator} it1 first iterator
 * @param {dao_AllocatedUsersIterator} it2 second iterator
 * @returns a composite iterator of it1 and it2
 */
CompositeAllocatedUsersIterator.create = function(it1, it2) {
	return new CompositeAllocatedUsersIterator(it1, it2);
};
