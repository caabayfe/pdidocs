var PopulateQualitativeChoiceFieldHelper = Class.create();
PopulateQualitativeChoiceFieldHelper.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getChoiceList(choiceSetSysId) {
        var choiceSetId = choiceSetSysId ? choiceSetSysId : this.getParameter('sysparm_choice_set');
        var choiceListObj = sn_gf.GFUtil.getChoiceListForUnit(choiceSetId);
        return (choiceListObj) ? JSON.stringify(choiceListObj) :
            JSON.stringify({
                'label': gs.getMessage('None'),
                'value': ''
            });
    },

    getOnlyChoiceValueList: function(choiceSetSysId) {
        var choiceListJson = JSON.parse(this.getChoiceList(choiceSetSysId));
        var key = null;
        var choiceListArray = [];
        for (key in choiceListJson) {
            if (choiceListJson[key]['value'] == '')
                choiceListArray.push(null);
            else
                choiceListArray.push(choiceListJson[key]['value']);
        }
        return choiceListArray;
    },

    type: 'PopulateQualitativeChoiceFieldHelper'
});
