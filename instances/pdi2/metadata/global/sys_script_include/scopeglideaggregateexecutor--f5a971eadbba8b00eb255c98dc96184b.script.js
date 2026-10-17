var ScopeGlideAggregateExecutor = Class.create();
ScopeGlideAggregateExecutor.prototype = {
    initialize: function( /*string*/ table) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this.wrapped = new GlideAggregate(table);
    },

    addAggregate: function(agg, name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addAggregate(agg, name);
    },

    addDomainQuery: function(d) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addDomainQuery(d);
    },


    addEncodedQuery: function(query /*: string*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addEncodedQuery(query);
    },


    addNotNullQuery: function(fieldname /*: string*/ ) /*: GlideQueryCondition;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addNotNullQuery(fieldname);
    },


    addNullQuery: function(fieldName /*: string*/ ) /*: GlideQueryCondition;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addNullQuery(fieldName);
    },

    addQuery: function(name /*: string*/ , operator /*: string*/ , value /*: string*/ ) /*: GlideQueryCondition;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addQuery(name, operator, value);
    },

    addTrend: function(fieldName /*: string*/ , timeInterval /*: string*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.addTrend(fieldName, timeInterval);
    },

    getAggregate: function(agg /*: string*/ , name /*: string*/ ) /*: string;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getAggregate(agg, name);
    },

    getAggregateEncodedQuery: function() /*: string;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getAggregateEncodedQuery();
    },

    getEncodedQuery: function() /*: string;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getEncodedQuery();
    },

    getRowCount: function() /*: number;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getRowCount();
    },

    getTableName: function() /*: string;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getTableName();
    },

    getValue: function(name /*: string*/ ) /*: string;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.getValue(name);
    },

    groupBy: function(name /*: string*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.groupBy(name);
    },


    hasNext: function() /*: boolean;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.hasNext();
    },


    next: function() /*: boolean;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.next();
    },


    orderBy: function(name /*: string*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.orderBy(name);
    },


    orderByAggregate: function(agg /*: string*/ , fieldName /*: string*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.orderByAggregate(agg, fieldName);
    },


    orderByDesc: function(name /*: string*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.orderByDesc(name);
    },


    query: function() /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.query();
    },

    setGroup: function(b /*: boolean*/ ) /*: void;*/ {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		return this.wrapped.setGroup(b);
    },

    type: 'ScopeGlideAggregateExecutor'
};
