var ChgMgtConflictWorker = Class.create();
ChgMgtConflictWorker.prototype = Object.extendsObject(ChgMgtConflictWorkerSNC, {

    initialize: function(_gr, _workerSysId) {
		ChgMgtConflictWorkerSNC.prototype.initialize.call(this, _gr, _workerSysId);
    },

    type: 'ChgMgtConflictWorker'
});
