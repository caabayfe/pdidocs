var ScopeGlideRecordExecutor = Class.create();
ScopeGlideRecordExecutor.prototype = {
    initialize: function(/*GlideRecord|string*/ wrapped) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		if (typeof wrapped === 'string')
			this.wrapped = new GlideRecord(wrapped);
		else
			this.wrapped = wrapped;

		this._conditions = [];
	},

	insert: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.insert();
	},

	insertMultiple: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.insertMultiple();
	},

	update: function(reason) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.update(reason);
	},

	updateMultiple: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.updateMultiple();
	},

	deleteRecord: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.deleteRecord();
	},

	setValue : function(name, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setValue(name, value);
	},

	setDisplayValue : function(name, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.getElement(name).setDisplayValue(value);
	},

	setWorkflow: function(flag) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setWorkflow(flag);
	},

	query: function(field, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.query(field, value);
	},

	_query: function(field, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped._query(field, value);
	},

	setForceUpdate: function(forceUpdate) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setForceUpdate(forceUpdate);
	},

	dotwalkCapableSetValue: function(name, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var nameSplit = name.split(".");
		var base = this.wrapped;
        for(var i = 0; i < nameSplit.length; i++) {
            if (i == (nameSplit.length -1)) {
                base[nameSplit[i]] = value;
             } else {
                base = base[nameSplit[i]];
             }

        }

	},

	dotwalkCapableGetValue: function(name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var nameSplit = name.split(".");
		var base = this.wrapped;
        for (var i = 0; i < nameSplit.length; i++) {
            if (i == (nameSplit.length -1)) {
                return base[nameSplit[i]];
             } else {
                base = base[nameSplit[i]];
             }
        }

		return null;
	},

	addQuery: function(name, operator, value) /*ScopeQueryCondition*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var childCondition = null;
		if (typeof operator === 'undefined') {
			childCondition = this.wrapped.addQuery(name);
		} else if (typeof value === 'undefined') {
			childCondition = this.wrapped.addQuery(name, operator);
		} else {
			childCondition = this.wrapped.addQuery(name, operator, value);
		}

		this._conditions.push(childCondition);
		return new ScopeQueryCondition(this, this._conditions.length - 1);
	},

	_addCondition: function(name, operator, value, parentConditionId, isOr) /*ScopeQueryCondition*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var condition = this._conditions[parentConditionId];
		if (!condition)
			throw new Error('Invalid parent condition id (' + parentConditionId + ') for _addOrCondition on field: ' + name);

		var childCondition = null;
		if (value == null) {
			if (isOr)
				childCondition = condition.addOrCondition(name, operator);
			else
				childCondition = condition.addCondition(name, operator);
		} else {
			if (isOr)
				childCondition = condition.addOrCondition(name, operator, value);
			else
				childCondition = condition.addCondition(name, operator, value);
		}

		this._conditions.push(childCondition);
		return new ScopeQueryCondition(this, this._conditions.length - 1);
	},

	addNotNullQuery: function(fieldname) /*ScopeQueryCondition*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var childCondition = this.wrapped.addNotNullQuery(fieldname);
		this._conditions.push(childCondition);
		return new ScopeQueryCondition(this, this._conditions.length - 1);
	},

	addNullQuery: function(fieldName) /*ScopeQueryCondition*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var childCondition = this.wrapped.addNullQuery(fieldname);
		this._conditions.push(childCondition);
		return new ScopeQueryCondition(this, this._conditions.length - 1);
	},

	hasNext: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.hasNext();
	},

	next: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.next();
	},

	_next: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped._next();
	},

	getValue: function(name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getValue(name);
	},

	getDecryptedValue: function(name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;
		
		return this.wrapped.getElement(name).getDecryptedValue();
	},

	addEncodedQuery: function(query) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.addEncodedQuery(query);
	},

	getEncodedQuery: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getEncodedQuery();
	},

	getLastErrorMessage: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getLastErrorMessage();
	},

	orderBy: function(name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.orderBy(name);
	},

	orderByDesc: function(name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.orderByDesc(name);
	},

	getElement: function(columnName) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getElement(columnName);
	},

	addActiveQuery: function() /*ScopeQueryCondition*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var childCondition = this.wrapped.addActiveQuery();
		this._conditions.push(childCondition);
		return new ScopeQueryCondition(this, this._conditions.length - 1);
	},

	addJoinQuery: function(joinTable, primaryField, joinTableField) /*ScopeQueryCondition*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var childCondition = this.wrapped.addJoinQuery(joinTable, primaryField, joinTableField);
		this._conditions.push(childCondition);
		return new ScopeQueryCondition(this, this._conditions.length - 1);
	},

	canCreate: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.canCreate();
	},

	canDelete: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.canDelete();
	},

	canRead: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.canRead();
	},

	canWrite: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.canWrite();
	},

	changes: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.changes();
	},

	chooseWindow: function(firstRow, lastRow, forceCount) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.chooseWindow(firstRow, lastRow, forceCount);
	},

	deleteMultiple: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.deleteMultiple();
	},

	getAttribute: function(fieldName) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.getAttribute(fieldName);
	},

	get: function(fieldName, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.get(fieldName, value);
	},

	getClassDisplayValue: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getClassDisplayValue();
	},

	getDisplayValue: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getDisplayValue();
	},

	getED: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getED();
	},

	getType: function(field) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getElement(field).getED().getInternalType();
	},

	getLabel: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getLabel();
	},

	getLink: function(noStack) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getLink(noStack);
	},

	getRecordClassName: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getRecordClassName();
	},

	getRowCount: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getRowCount();
	},

	getTableName: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getTableName();
	},

	getUniqueValue: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getUniqueValue();
	},

	_initialize: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.initialize();
	},

	isActionAborted: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.isActionAborted();
	},

	isNewRecord: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.isNewRecord();
	},

	isValid: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.isValid();
	},

	isValidField: function(columnName) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.isValidField(columnName);
	},

	isValidRecord: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.isValidRecord();
	},

	newRecord: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.newRecord();
	},

	operation: function() {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.operation();
	},

	setAbortAction: function(b) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setAbortAction(b);
	},

	setLimit: function(maxNumRecords) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setLimit(maxNumRecords);
	},

	setNewGuidValue: function(guid) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setNewGuidValue(guid);
	},

	setLocation: function(rowNumber) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped.setLocation(rowNumber);
	},

    type: 'ScopeGlideRecordExecutor'
};
