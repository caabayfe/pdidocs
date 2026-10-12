// Service APIs must be defined in the "Services" namespace - leave the "Services." prefix on the class name and prototype

Services.ServiceTest1 = Class.create();
Services.ServiceTest1.prototype = {
    initialize: function() {
        // Place any Service API initialization code here - runs each time an API is called on this Service
        
    },
    
    // Add Service APIs here as methods for this class
    
    get: function(parms) {
        this.data.a = 1;
        this.data.id = parms.id;
    },
    
    getWithError: function(parms) {
        this.data.a = 1;
        this.data.id = parms.id;
        this.setError(parms.code, parms.msg);
        this.setHttpResponseCode(parms.http);
    },
    
    getWithArray: function(parms) {
        this.data.rootArray = [ 1, 2, 3, '<test!>' ];
		this.data.embeddedArray = {
			anArray: [ 1, 2, 3, '<test!>' ]
		};
    },
    
    type: 'ServiceTest1'
}
