var ChangeModelChgReqAPI = Class.create();
ChangeModelChgReqAPI.prototype = Object.extendsObject(ChangeModelChgReqAPISNC,{
    initialize: function(changeGr, _gs) {
		ChangeModelChgReqAPISNC.prototype.initialize.call(this, changeGr, _gs);
    },

    type: 'ChangeModelChgReqAPI'
});

ChangeModelChgReqAPI.newNormal = ChangeModelChgReqAPISNC.newNormal;
ChangeModelChgReqAPI.newStandard = ChangeModelChgReqAPISNC.newStandard;
ChangeModelChgReqAPI.newEmergency = ChangeModelChgReqAPISNC.newEmergency;
ChangeModelChgReqAPI.newChange = ChangeModelChgReqAPISNC.newChange;
