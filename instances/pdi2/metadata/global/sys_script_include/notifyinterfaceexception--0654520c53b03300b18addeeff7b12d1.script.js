var NotifyInterfaceException = Class.create();
NotifyInterfaceException.prototype = {
    initialize: function(msg) {
		if (msg instanceof Array) {
			this.errors = msg;
			this.message = msg.join('\n');
		} else {
			this.message = msg + '';
			this.errors = [this.message];
		}
    },

    type: 'NotifyInterfaceException'
};
