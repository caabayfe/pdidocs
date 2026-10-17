var NowAssistAdminExtUtil = Class.create();
NowAssistAdminExtUtil.prototype = {
    initialize: function() {},

    /**
     * hasMatchingCondition for the skill will validate the matching condition and returns boolean
     * 
     * @param {Obj} skillConfigObj - The obj contains data of a skill config
     * 
     * @return {Boolean} if hasMatchingCondition matches the condition it will return true else false
	 * if true, we will pick that specific implementation methods.
     **/
    hasMatchingCondition: function(skillConfigObj) {
        return false;
    },

    /**
     * getReviewPayload for the skill will return transformed review data from skillConfigObj
     *
     * @param {Obj} skillConfigObj - The obj contains data of a skill config 
	 * @param {Obj} payload - The obj contains display value data of a skill config
     * 
     * @return {Obj} returns transformed obj which feeds in to review and activate macroponent.
     **/
    getReviewPayload: function(skillConfigObj, payload) {
		//reference code is in below api call
		// var util = new sn_nowassist_admin.NowAdminAssistUtil();
        // return util.getReviewPayload(skillConfigObj);
		// If you need in-product and NAP cards to be overriden in this review payload, make sure to create necassary objects honoring the template in the array with id as follows :
		// For inProduct card, id should be -> delivery_step_inProduct
		// For NAP card, id should b -> delivery_step_nap
    },
    type: 'NowAssistAdminExtUtil'
};
