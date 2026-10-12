var ConditionsQuerySecure = Class.create();
ConditionsQuerySecure.prototype = {
    initialize: function() {
    },
	
	getConditionQueryCount: function(tableName, encodedQuery) {
		if (!GlideTableDescriptor.isValid(tableName))
		   return "Not a valid table name";

		/*
		* Due to PRB1341370, we need to use GlideRecord to check ACLs.
		* Once the issue is fixed, we can use GlideAggregate for both
		* checking ACLs and finding row count.
		*/
		var access = new GlideRecord(tableName);
		if (!access.canRead())
			return "User not allowed to access table: " + tableName;

		var gr = new GlideAggregate(tableName);
		// Need to enforce field-level ACLs on the client-provided encoded query.
		// Terms with fields the user can't read are pruned from the query. May return a
		// wrong record count, but the user will see an error msg explaining why
		gr.addEncodedQuery(encodedQuery, true);
		gr.addAggregate("COUNT");
		gr.query();
		var count = 0;
		if (gr.next())
			count = gr.getAggregate("COUNT");

		// var msg = gs.getMessage("records match condition");
		// if (count == 1)
		// 	msg = gs.getMessage("record matches condition");

		// return count + " " + msg;
		// i18N Internationalization: Including number in the string
		var msg = gs.getMessage("No. of records matching the condition: {0}", [count]);
		return msg;
	},

    type: 'ConditionsQuerySecure'
};
