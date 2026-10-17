var VAConditionBuilderUtil = Class.create();
VAConditionBuilderUtil.prototype = {
    initialize: function() {
        this.vAConditionBuilderHelper = new VAConditionBuilderHelper();
        this.tables = {
            "va_conversations": "va_conversations",
            "va_users": "va_users",
            "va_funnels": "va_funnels"
        };
    },
    /**
     * @param { Object } vAComparisonBuilderRows - The required parameters of convertToAppsee @method.

		 @schema vAComparisonBuilderRows
			'field' {Object} | Mandatory
			'operator' {String} | Mandatory
			'conditionValue' {Boolean}, {String}, {Array}, {Number} | Mandatory - INFO: @typeOf(operator)
			'comparisonType' {String} | Mandatory
			'children' {null}, {Array} | Mandatory - INFO: Takes in {@vAComparisonBuilderRows}

	 * @returns {Object} - Return Appsee understandable JSON Query
		 'success' {Boolean} - INFO: Success status of the Query transformation: True - Successfull, False - Unsuccessfull
		 'query' {Object} - INFO: Response of the transformed query. {null} is success = false.
		 'error' {String} - INFO: Unsuccessfull error code. {null} is success = true.

	Examples:
		1. Input: {vAComparisonBuilderRows}
			[{
				"field": "Favorite",
				"operator": "matches",
				"conditionValue": "true",
				"comparisonType": "NEW_QUERY",
				"children": null
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"IsFavorite":{"exists":true}}]}


		2. Input: {vAComparisonBuilderRows}
			[{
				"field": "Channel Name",
				"operator": "is any of",
				"conditionValue": ["Slack", "Web Client"],
				"comparisonType": "NEW_QUERY",
				"children": null
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"and":[{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"eq":"DynamicProperties"}},{"Properties":{"nested_match":{"and":[{"Channel Name":{"is_any":["Slack","Web Client"]}}]}}}]}}}]}]}


		3. Input: {vAComparisonBuilderRows}
			[{
				"field": "Duration",
				"operator": "greater than",
				"conditionValue": 10,
				"comparisonType": "NEW_QUERY",
				"children": null
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"and":[{"SessionDuration":{"gt":10000}}]}]}


		4. Input: {vAComparisonBuilderRows}
			[{
				"field": "Self Solve",
				"operator": "matches",
				"conditionValue": true,
				"comparisonType": "NEW_QUERY",
				"children": null
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"and":[{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"eq":"DynamicProperties"}},{"Properties":{"nested_match":{"and":[{"Self Solve":{"eq":true}}]}}}]}}}]}]}


		5. Input: {vAComparisonBuilderRows}
			[{
				"field": "Topic",
				"operator": "contains any of",
				"conditionValue": ["Fallback Topic.", "Greetings."],
				"comparisonType": "NEW_QUERY",
				"children": [] 
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"and":[{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"contains_any":["Fallback Topic.","Greetings."]}}]}}}]}]}


		6. Input: {vAComparisonBuilderRows}
			[{
				"field": "Topic",
				"operator": "contains any of",
				"conditionValue": ["Fallback Topic."],
				"comparisonType": "NEW_QUERY",
				"children": [
					{
						"field": "Last Node Visited",
						"operator": "matches",
						"conditionValue": true,
						"comparisonType": "NEW_QUERY",
						"children": null
					}
				]
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"and":[{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"contains_any":["Fallback Topic."]}}]}}},{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"eq":"Fallback Topic."}},{"Properties":{"nested_match":{"and":[{"Last Node Visited":{"eq":true}}]}}}]}}}]}]}


		7. Input: {vAComparisonBuilderRows}
			[{
				"field": "Events",
				"operator": "contains any of",
				"conditionValue": ["Conversation End Reason"],
				"comparisonType": "NEW_QUERY",
				"children": []
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"and":[{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"contains_any":["Conversation End Reason"]}}]}}}]}]}


		8. Input: {vAComparisonBuilderRows}
			[{
				"field": "Favorite",
				"operator": "matches",
				"conditionValue": "true",
				"comparisonType": "NEW_QUERY",
				"children": null
			},
			{
				"field": "Channel Name",
				"operator": "is any of",
				"conditionValue": ["Slack", "Web Client"],
				"comparisonType": "AND",
				"children": null
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"and":[{"IsFavorite":{"exists":true}}, {"and":[{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"eq":"DynamicProperties"}},{"Properties":{"nested_match":{"and":[{"Channel Name":{"is_any":["Slack","Web Client"]}}]}}}]}}}]}]}



		9. Input: {vAComparisonBuilderRows}
			[{
				"field": "Favorite",
				"operator": "matches",
				"conditionValue": "true",
				"comparisonType": "NEW_QUERY",
				"children": null
			},
			{
				"field": "Self Solve,
				"operator": "matches",
				"conditionValue": true,
				"comparisonType": "OR",
				"children": null
			}]

			Output: new sn_ci_analytics.VAConditionBuilderUtil().convertToAppsee(vAComparisonBuilderRows)
			{"or":[{"IsFavorite":{"exists":true}},{"SessionCustomEvents":{"nested_match":{"and":[{"Name":{"eq":"DynamicProperties"}},{"Properties":{"nested_match":{"and":[{"Self Solve":{"eq":true}}]}}}]}}}]}


	 */
    convertToAppsee: function(vAComparisonBuilderRows) {
        var query = {};
        try {
            query = this.vAConditionBuilderHelper.transformConditionBuilder(vAComparisonBuilderRows, this.tables.va_conversations);
            if (query)
                return this.vAConditionBuilderHelper.success(query);
            else
                return this.vAConditionBuilderHelper.fail("invalid_query");
        } catch (e) {
            return this.vAConditionBuilderHelper.fail("invalid_query");
        }
    },
    /**
    	* @param { Object } vAFunnelBuilderRows - The required parameters of convertToAppseeFunnel @method.

    		* @schema vAFunnelBuilderRows
    			'StepNumber' {Integer} | Mandatory
    			'VAComparisonModel' {Array} | Mandatory
    				'field' {Object} | Mandatory
    				'conditionVaue' {String | null} | Mandatory
    				'children' {Array} | Mandatory  @typeof VAComparisonModel

    		* @returns {Object} - Return Appsee understandable JSON Query
    			 'success' {Boolean} - INFO: Success status of the Query transformation: True - Successfull, False - Unsuccessfull
    			 'query' {Array} - INFO: Response of the transformed query. {null} is success = false.
    			 'error' {String} - INFO: Unsuccessfull error code. {null} is success = true.

    			1. Input @vAFunnelBuilderRows
    				[
    					{
    						"StepNumber": 1,
    						"VAComparisonModel": [
    							{
    								"field": "Conversation Start (Any)",
    								"conditionValue": null,
    								"children": []
    							}
    						]
    					},
    					{
    						"StepNumber": 2,
    						"VAComparisonModel": [
    							{
    								"field": "Event Trigger",
    								"conditionValue": "AI Search",
    								"children": [
    									{
    										"field": "Last Node Visited",
    										"conditionValue": "2",
    										"children": []
    									},
    									{
    										"field": "End State",
    										"conditionValue": "1",
    										"children": []
    									}
    								]
    							},
    							{
    								"field": "Event Trigger",
    								"conditionValue": "_auto_resolution_",
    								"children": []
    							}
    						]
    					}
    				]  
    			Output: {"success":true,"query":[{"StepNumber":1,"Alternatives":[{"StepType":3,"ExtraValues":{}}]},{"StepNumber":2,"Alternatives":[{"StepType":1,"ExtraValues":{"Last Node Visited":"2","End State":"1"},"Value":"AI Search"},{"StepType":1,"ExtraValues":{},"Value":"_auto_resolution_"}]}],"error":null}


    			2. Input @vAFunnelBuilderRows
    				[
    					{
    						"StepNumber": 1,
    						"VAComparisonModel": [
    							{
    								"field": "Conversation Start (1st)",
    								"conditionValue": null,
    								"children": []
    							}
    						]
    					},
    					{
    						"StepNumber": 2,
    						"VAComparisonModel": [
    							{
    								"field": "Topic Node Visit",
    								"conditionValue": "eefd285053130010cf8cddeeff7b12b9",
    								"children": []
    							}
    						]
    					},
    					{
    						"StepNumber": 3,
    						"VAComparisonModel": [
    							{
    								"field": "Conversation Start (Any)",
    								"conditionValue": null,
    								"children": []
    							}
    						]
    					},
    					{
    						"StepNumber": 4,
    						"VAComparisonModel": [
    							{
    								"field": "Topic Node Visit",
    								"conditionValue": "b19775fa536310103296ddeeff7b12ff",
    								"children": []
    							},
    							{
    								"field": "Event Trigger",
    								"conditionValue": "Confirm Appointment",
    								"children": [
    									{
    										"field": "Channel Name",
    										"conditionValue": "Slack",
    										"children": []
    									}
    								]
    							}
    						]
    					}
    				]

    			Output: {"success":true,"query":[{"StepNumber":1,"Alternatives":[{"StepType":4,"ExtraValues":{}}]},{"StepNumber":2,"Alternatives":[{"StepType":0,"ExtraValues":{},"Value":"eefd285053130010cf8cddeeff7b12b9"}]},{"StepNumber":3,"Alternatives":[{"StepType":3,"ExtraValues":{}}]},{"StepNumber":4,"Alternatives":[{"StepType":0,"ExtraValues":{},"Value":"b19775fa536310103296ddeeff7b12ff"},{"StepType":1,"ExtraValues":{"Channel Name":"Slack"},"Value":"Confirm Appointment"}]}],"error":null}
    **/
    convertToAppseeFunnel: function(vAFunnelBuilderRows) {
        var steps = [];
        try {
            steps = this.vAConditionBuilderHelper.transformConditionBuilder(vAFunnelBuilderRows, this.tables.va_funnels);
            if (steps)
                return this.vAConditionBuilderHelper.success(steps);
            else
                return this.vAConditionBuilderHelper.fail("invalid_steps");
        } catch (e) {
            return this.vAConditionBuilderHelper.fail("invalid_steps");
        }
    },
    convertToAppseeUsers: function(vAComparisonBuilderRows) {
        var query = {};
        try {
            query = this.vAConditionBuilderHelper.transformConditionBuilder(vAComparisonBuilderRows, this.tables.va_users);
            if (query)
                return this.vAConditionBuilderHelper.success(query);
            else
                return this.vAConditionBuilderHelper.fail("invalid_query");

        } catch (e) {
            return this.vAConditionBuilderHelper.fail("invalid_query");
        }
    },
    type: 'VAConditionBuilderUtil'
};
