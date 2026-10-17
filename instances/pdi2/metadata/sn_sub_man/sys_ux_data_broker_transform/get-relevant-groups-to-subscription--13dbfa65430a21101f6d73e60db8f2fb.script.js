/**
 * Data broker to get groups relevant to a subscription
 * @param {object} input - Gets subscriptionId and filter queries based on which filtering should be applied on results
 * @param {Object} groups - An object containing group information with unique keys.
 *
 * Type def of groups
 *	type ObjectWithGroups = {
 *		groups: Groups;
 *	};
 *
 *	type Groups = {
 *		[key: string]: Group;
 *	};

 *	type Group = {
 *		label: string;
 *	};
 *	
 *	@example
 *	  "groups": {
 *		"019ad92ec7230010393d265c95c260dd": {
 *		"label": "Analytics Settings Managers SF"
 *		},
 *		"0270c251c3200200be647bfaa2d3aea6": {
 *		"label": "Customer Service Support"
 *		},
 *		"0a52d3dcd7011200f2d224837e6103f2": {
 *		"label": "Application Development"
 *		}
 *	}
 */
function transform(input) {

    const grGroups = new GlideRecord('sn_sub_man_st_unallocated_group_recommendation');
    let relevantGroups = {};
    try {
        grGroups.addQuery('subscription', input.subscriptionId);
        if (!gs.nil(input.filterQuery)) {
            grGroups.addEncodedQuery(input.filterQuery);
        }
        //sort by weight in descending order
        grGroups.orderByDesc('weight');
        grGroups.query();
        while (grGroups.next()) {
            const id = grGroups.group;
            let groupObj = {};
            const groupObjKey = "label";
            const groupObjVal = grGroups.group.name.toString();
            groupObj[groupObjKey] = groupObjVal;
            relevantGroups[id] = groupObj;
        }

    } catch (err) {
        const errMessage = 'Could not get relevant roles for subscription id: ' + input.subscriptionId;
        gs.addErrorMessage(errMessage + ' with error ' + err.message);
        return errMessage;
    }
    let returnObj = {};
    const returnObjKey = "groups";
    returnObj[returnObjKey] = relevantGroups;

    return returnObj;

}
