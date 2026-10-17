// This is standard SI
function ClothoConnectionCheck() { }
ClothoConnectionCheck.prototype = {
	  initialize: function () {
	},

	isMetricBasedConnectionAlive: function () {

		var getWorkerState = function (workerSysId) {
			var gr = new GlideRecord('sys_execution_tracker');
			if (!gr.isValid()) {
				return -1;
			}
			gr.get(workerSysId);
			return gr.state;
		};
		/------------------------------------------------------------/

		var worker = new sn_clotho.ClothoConnectionTestWorker();
		worker.start();
		var workerSysId = worker.getProgressID();
		if (workerState == '-1') {
			gs.warn("ClothoConnectionCheck. Clotho connection test worker can't be found.");
			return false;
		}

		//maxAttemps to check worker state.
		var maxAttempts = gs.getProperty("glide.clotho.check_state_max_attempts", 10);
		//delay between check worker state. Default - 5 seconds.
		var delay = gs.getProperty("glide.clotho.check_state_delay", 5000);

/*
		State:
			Pending: 0
			Running: 1
			Succesifull: 2
			Filed: 3
			Canceled: 4
*/
		for (var i = 0; i < maxAttempts; i++) {
			var workerState = getWorkerState(workerSysId);
			if (workerState == 2) { //Succesifull
				return true;
			} else if (workerState > 2) { // Filed or Canceled
				return false;
			}
			//Pending or Runniing - wait. Sleep default 5 sec.
			gs.sleep(delay);
		}
		return false;
	},

	type: 'ClothoConnectionCheck'
  };
