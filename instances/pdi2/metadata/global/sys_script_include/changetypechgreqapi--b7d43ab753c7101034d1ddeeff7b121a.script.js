var ChangeTypeChgReqAPI = Class.create();
ChangeTypeChgReqAPI.prototype = Object.extendsObject(ChangeTypeChgReqAPISNC, {
    initialize: function(changeRequestGr) {
		ChangeTypeChgReqAPISNC.prototype.initialize.call(this, changeRequestGr);
    },

    type: 'ChangeTypeChgReqAPI'
});

ChangeTypeChgReqAPI.newNormal = ChangeTypeChgReqAPISNC.newNormal;
ChangeTypeChgReqAPI.newStandard = ChangeTypeChgReqAPISNC.newStandard;
ChangeTypeChgReqAPI.newEmergency = ChangeTypeChgReqAPISNC.newEmergency;
ChangeTypeChgReqAPI.newChange = ChangeTypeChgReqAPISNC.newChange;
