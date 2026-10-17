const FormFactorHelper = Class.create();
FormFactorHelper.prototype = {
    initialize: function() {
		/* OOTB Form Factors */
        this.GLOBAL_FORM_FACTORS = {
            now_default: {
                "max-width": null,
                "reference": "macroponent"
            },
            now_medium: {
                "max-width": 1280,
                "reference": "macroponent"
            },
            now_small: {
                "max-width": 500,
                "reference": "macroponent"
            }
        };
    },

    /**
    *  Retrieves all form factors by combining global and custom form factors.
    *  @param {object} customFormFactors form factors from sys_ux_macroponent.form_factors.
    *  @returns {object} combined form factor object.
    */
    getAllFormFactors: function(customFormFactors) {
        if(!customFormFactors)
            customFormFactors = {};
		// custom form factors with same name as global will be overriden
        return {...customFormFactors, ...this.GLOBAL_FORM_FACTORS};
		 
    },

    /**
    *  Strips all global form factors from the combined form factor object.
    *  @param {object} formFactors combined form factor object .
    *  @returns {object} custom form factor object.
    */
	stripGlobalFormFactors: function(formFactors) {
        if(!formFactors)
            return {};
		// remove global form factors (now_*)
        const customFormFactorEntries = Object.entries(formFactors).filter( ([ffId, q])  => !ffId.startsWith('now_'));
		return Object.fromEntries(customFormFactorEntries);
    },
   
    type: 'FormFactorHelper'
};
