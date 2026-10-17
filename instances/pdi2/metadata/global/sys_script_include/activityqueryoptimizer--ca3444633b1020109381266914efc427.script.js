var ActivityQueryOptimizer = Class.create();
ActivityQueryOptimizer.prototype = {
	initialize: function() {
		this.OR_OP_SUPLIMENT = "#####OR#####";
	},


	getOptimizedGlideRecord: function(gr) {
		if(!gr)
			return gr;
		
		var query = gr.getEncodedQuery();
		var isWorkflow = gr.isWorkflow();
		var newQuery = this.optimizeMe(query);

		gr.initialize();
		gr.addEncodedQuery(newQuery);
		gr.setWorkflow(isWorkflow);
		return gr;
	},
	
	optimizeMe: function(encodedQuery, tableName) {
		var self = this;
		var groupedQueries = [];
		var hardConstraint = "";

		/*
		*  We have 3 query operators in servicenow, 
		*  1) ^ (AND), 
		*  2) ^OR (OR), 
		*  3) ^NQ (New Query or Grouped Query)
		*  The other general operator ^EQ is meant for End Query.
		* 
		*/

		// Here in this optimize, we are going to deal with AND or NQ operators.
		// So, replacing (^OR) operator with OR_OP_SUPLIMENT to make it safe from query processing.

		var encodedQueryParts = encodedQuery.split("^OR");
		var newQuery = encodedQueryParts.join(this.OR_OP_SUPLIMENT);
		var queries = newQuery.split("^EQ");

		/* 
		*  Process each grouped query separately and build the query object
		*  The general thumb rule we are following here during object construction is, 
		*    > key-value pairs in the JSON object represents AND 
		*    > elements in the Array represents OR
		*/
		queries.forEach(function (query) {
			if (query.startsWith("^NQ") || !query.startsWith("^")) {
				groupedQueries.push(self._buildQueryObject(query));
			} else {
				hardConstraint += query.substring(1); //remove the ^ operator.
			}
		});

		try{
			var optimizedQueryObjects =  self._optimizeGroupedQueries(groupedQueries);
			var optimizedQuery = self._buildOptimizedQuery(optimizedQueryObjects);

			optimizedQuery = optimizedQuery+"^"+hardConstraint;
			//Re-placing the ^OR operator. Do not use regex replace here, may cause DOS.
			optimizedQuery = optimizedQuery.split(this.OR_OP_SUPLIMENT);
			optimizedQuery = optimizedQuery.join('^OR');
			return optimizedQuery;
		} catch(e) {
			return encodedQuery;
		}
	},

	_buildOptimizedQuery: function(optimizedQueryObjects) {
		var self = this;
		var queries = [];

		var buildQueryFromArray = function(query, queryObjects) {
			queryObjects.forEach(function(queryObject){
				buildQueryFromObject(query, queryObject);
			});
		};

		var buildQueryFromObject = function(currentQuery, queryObject) {
			var hasChildGroups = false;
			for(var property in queryObject) {
				var value = queryObject[property];
				if(typeof value == "string"){
					currentQuery +=  (currentQuery ? "^" : "") + value;
				} else if (Array.isArray(value)) {
					hasChildGroups = true;
					buildQueryFromArray(currentQuery, value);
				} else {
					throw "Illegal Query Object";
				}
			}

			// Reached the leaf? then it is your grouped optimized query!!
			if(!hasChildGroups) {
				queries.push(currentQuery+"");
			}
		};

		buildQueryFromArray("", optimizedQueryObjects);

		return queries.join('^EQ^NQ')+'^EQ'; //Group all the group-queries
	},

	_buildQueryObject: function (query) {
		// example query object - 
		// ^NQactivity_type_id=014c5b4d73321010e37d71ef64f6a704^active=true^actor_idIN0ec487e6db7310105d2cfa642c961966

		if (query.startsWith('^NQ')) //It is a new query, so remove the prefix
			query = query.substring(3);

		var conditions = query.split("^");
		var queryObject = {};
		for (var i = 0; i < conditions.length; i++) {
			queryObject[i] = conditions[i];
		}

		return queryObject;
	},

	/*
	* Returns most repeated condition in the query object
	*/
	_getMostRepeatedCondition: function (pRepetitions) {
		var mostRepeatedCondition = null;
		for(var property in pRepetitions) {
			if ((mostRepeatedCondition == null || pRepetitions[property] > pRepetitions[mostRepeatedCondition]) 
				&& pRepetitions[property] > 1 )
				mostRepeatedCondition = property;
		}

		return mostRepeatedCondition;
	},


	_optimize: function (pGroupedQueries, mostRepeatedCondition) {

		// Group the similar queries together
		// The equation applied here is (AB + AC) ==> A(B + C) 
		// here, I am taking out the most repeated constraint from the query objects to build the constraint groups.
		var newORedGroups = [];
		var nonSatisfiedGroups = [];
		pGroupedQueries.forEach(function (query) {
			var isFound = false;

			for (var property in query) {
				if (query[property] == mostRepeatedCondition) {
					isFound = true;
					delete query[property];
					break;
				}
			}

			if (isFound) {
				newORedGroups.push(query);
			} else
				nonSatisfiedGroups.push(query);
		});

		var optimizedGroups = [];
		if (newORedGroups.length > 0) {
			newORedGroups = this._optimizeGroupedQueries(newORedGroups);
			if (newORedGroups.length > 0)
				optimizedGroups = optimizedGroups.concat([
					{
						0: mostRepeatedCondition,
						1: newORedGroups
					}
				]);
		}

		if (nonSatisfiedGroups.length > 0){
			nonSatisfiedGroups = this._optimizeGroupedQueries(nonSatisfiedGroups);
			if (nonSatisfiedGroups.length > 0)
				optimizedGroups = optimizedGroups.concat(nonSatisfiedGroups);
		}

		return optimizedGroups;
	},


	_groupConditions: function (pGroupedQueries) {
		var conditions = {};
		var untouchedQueryObjects = [];
		var groupedConditions = [];

		var conditionGroupHelper = function(condition, operator, isMultiValueCondition) {
			var operands = condition.split(operator);
			var group = operator;
			if(operator == "=") group = "IN";
			else if (operator == "!=") group = "NOT IN";

			// 			conditions[operands[0]+group] = (conditions[operands[0]+group] || []);
			conditions[operands[0]+group] = (conditions[operands[0]+group] || [])
				.concat( isMultiValueCondition ? (operands[1] || "").split(',') : [operands[1]]);
		};

		pGroupedQueries.forEach(function (queryObject) {
			var keys = Object.keys(queryObject);
			// Process each individual condition to make it much performent
			// Group the conditions =,IN and !=, NOT IN to form versatile IN, and NOT IN clauses respectively.
			if (keys.length == 1) {
				var condition = queryObject[keys[0]];
				var operands;
				if(condition.indexOf(this.OR_OP_SUPLIMENT) > -1){
					untouchedQueryObjects.push(queryObject);
				}
				else if (condition.indexOf("!=") > -1) {
					conditionGroupHelper(condition, "!=");
				} else if(condition.indexOf("NOT IN") > -1) {
					conditionGroupHelper(condition, "NOT IN", true);
				}
				else if (condition.indexOf("=") > -1) {
					conditionGroupHelper(condition, "=");
				} else if (condition.indexOf("IN") > -1) {
					conditionGroupHelper(condition, "IN", true);
					// 					operands = condition.split('IN');
					// 					operands[1] = (operands[1] || "").split(',');
					// 					conditions[operands[0]] = (conditions[operands[0]] || []).concat(operands[1]);
				} 
				//Do not touch other operators until unless you know what you are doing :) 
				else {
					untouchedQueryObjects.push(queryObject);
				}
			} else {
				untouchedQueryObjects.push(queryObject);
			}
		}.bind(this));

		var conditionKeys = Object.keys(conditions);
		if (conditionKeys.length > 0) {
			var groupedCondition = {};
			for (var i = 0; i < conditionKeys.length; i++) {
				groupedCondition[i] = conditionKeys[i] + conditions[conditionKeys[i]].join(',');
			}
			groupedConditions.push(groupedCondition);
		}

		if (untouchedQueryObjects.length > 0)
			groupedConditions = groupedConditions.concat(untouchedQueryObjects);

		return groupedConditions;
	},

	_optimizeGroupedQueries: function (pGroupedQueries) {
		var repetitions = {};
		pGroupedQueries.forEach(function (query) {
			for(var property in query) {
				//TODO: Apply smart repetition, ex: sysId=121 is equal to sysIdIN121
				repetitions[query[property]] = (repetitions[query[property]] || 0) + 1;
			}
		});

		var mostRepeatedCondition = this._getMostRepeatedCondition(repetitions);

		if (!mostRepeatedCondition) {
			if (Array.isArray(pGroupedQueries)) {
				pGroupedQueries = this._groupConditions(pGroupedQueries);
			}
			return pGroupedQueries;
		}

		return this._optimize(pGroupedQueries, mostRepeatedCondition);
	},


	type: 'ActivityQueryOptimizer'
};
