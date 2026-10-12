const ScreenTestValue = Class.create();
ScreenTestValue.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_screen_test_values',
    FIELDS: ['macroponent_config'],
    FIELD_TYPES: {
        macroponent_config: 'json',
        screen: 'reference'
    },

    /**
     * @param fields {string[]}
     */
    initialize: function(fields) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, undefined, undefined, this.FIELD_TYPES);
    },

    /**
     * @param sysId {string} the ID of the record we want to get or the screen SysID we are related to
     * @param shouldReturnGR {boolean} true if we are returning the GlideRecord vs. an object with values
     */
    getRecordById: function(sysId, shouldReturnGR) {
        try {
            const recordGR = this.get(this.table, 'sys_id=' + sysId + "^ORscreen.sys_id=" + sysId + "^ORmacroponent.sys_id=" + sysId, false, this.noDomain);
            if (recordGR.next()) {
                return shouldReturnGR ? recordGR : this.getValuesFromGlideRecord(recordGR);
            }
        } catch (err) {
            gs.error(err);
        }
        return null;
    },

    /**
     * @param fields {object} a object with keys in camel case and values
     */
    updateRecord: function({
        sysId,
        screen,
        macroponent,
        macroponentConfig
    }) {
		const fields = {
			macroponentConfig
		};
        let searchId = sysId;
        if (screen) {
			fields.screen = screen;
            searchId = screen;
        }
        if (macroponent) {
			fields.macroponent = macroponent;
            searchId = macroponent;
        }
		gs.info(searchId)
        if (searchId) {
            let screenTestValueGR = this.getRecordById(searchId, true);
            if (screenTestValueGR) {
                if (screenTestValueGR.canWrite()) {
                    this.setFieldValues(screenTestValueGR, fields);
                    return screenTestValueGR.update();
                } else {
                    return {
                        error: true,
                        reason: !screenTestValueGR ? BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND : BuilderToolkitConstants.ERRORS.WRITE_ACCESS_ERROR_MESSAGE
                    };
                }
            }else{
				return this.createRecord(fields);
			}
        }
    },
	deleteRecord: function(sysId){
		const screenTestValueGR = this.getRecordById(sysId,true);
		if(screenTestValueGR && screenTestValueGR.next()){
			BuilderToolkitAPIBase.prototype.deleteRecord.call(this, {sysId:screenTestValueGR.getUniqueValue()});
		}
	},
	copyRecord:function(sysId, newMacroponentId){
		const screenTestValueGR = this.getRecordById(sysId,true);
		if(screenTestValueGR && screenTestValueGR.next()){
			return BuilderToolkitAPIBase.prototype.copyRecord.call(this, screenTestValueGR, null, {macroponent:newMacroponentId});
		}
	},

    type: 'ScreenTestValue'
});
