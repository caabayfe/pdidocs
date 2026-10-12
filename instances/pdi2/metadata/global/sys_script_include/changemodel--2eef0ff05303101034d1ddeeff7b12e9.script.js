var ChangeModel = Class.create();
ChangeModel.prototype = Object.extendsObject(ChangeModelSNC, {
    initialize: function(modelGr, _gs) {
        ChangeModelSNC.prototype.initialize.call(this, modelGr, _gs);
    },

    type: 'ChangeModel'
});

ChangeModel.getDefaultReadRoles = ChangeModelSNC.getDefaultReadRoles;
ChangeModel.getRefQualForChangeRequest = ChangeModelSNC.getRefQualForChangeRequest;
ChangeModel.getDefaultModelValue = ChangeModelSNC.getDefaultModelValue;
ChangeModel.getDefaultTypeValue = ChangeModelSNC.getDefaultTypeValue;
ChangeModel.getModel = ChangeModelSNC.getModel;
