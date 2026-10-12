var hr_sp_coe_config = Class.create();
hr_sp_coe_config.prototype = {
    initialize: function() {
    },

	/* Activiate/Deactivate record
	 * @PARAM gr - GlideRecord
	 * @PARAM deactivate - boolean (optional)
	 * @RETURN sys_id of record if successfully updated. if not, null
	 */
	updateCoeRecordProducerGr: function (gr, deactivate) {
		gr.active = !deactivate;
		return gr.update();
	},
	
    type: 'hr_sp_coe_config'
};
