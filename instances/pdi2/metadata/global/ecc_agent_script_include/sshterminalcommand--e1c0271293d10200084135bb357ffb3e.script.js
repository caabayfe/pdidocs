ms.include("JsSshIncludes");

var SSHTerminalCommand = Class.create();
SSHTerminalCommand.prototype = Object.extendsObject(AProbe, {

    initialize : function(probe) {
        this.probe = probe;
        this.output = "";
        this.createOutputRecord = false;
		this.source = this.getParameter(SOURCE);
    },
    
    /**
     * Runs the probe instance
     */
    run : function() {
		ms.log('SSHTerminalCommand: run');
        this.init();
        
       
        // If something fails in the probe code and an unhandled exception is thrown, make sure we clean up
        try {
            this.process();
        }catch (ex) {
			if (ex instanceof AuthenticationFailureException) {
				ms.log("Authentication failed for host " +  this.source + ", check the SSH credential definition ");
			} else {
				ms.log(ex);
				this.setError(ex);
			}
            
        } finally {
            this.cleanup();
			this.commandExecutor.terminate();
        }
		
    },
    
     //This is the abstruct function that must be implemented in derived class
	 // This function should prepare the output and assign it to this.output
    
     runCommands : function(cliCommands) {
         
         this.newResult();
         var elements = this.createElement('commands', '');
         this.setCurrent(elements);
         for(var aIndex in cliCommands){
             var cliCommand = cliCommands[aIndex];
             var cmdResult = this.commandExecutor.execCommand(cliCommand);
             if(typeof cmdResult === 'undefined'){
                cmdResult = 'empty';
             }
             var element = this.createElement('command', '');
             this.setCurrent(element);
             this.setAttribute('executed',cliCommand);
             this.probe.createCDATAElement('result',cmdResult);
             this.pop();
         }
         this.pop();
     },
    
    /**
      * Attempts to initialize the commandExecutor instance to allow the process method to do its work
      */
    init : function() {
		ms.log('SSHTerminalCommand: init');
        this.commandExecutor = this.getCommandExecuter();
    },
    
    /**
      * Abstract function to run the probe functionality - the derived probes should have a body for this
      */
    process : function() {
        var CLI_COMMANDS_PARAM = 'cli_commands';
		var cliCommands = this.getParameter(CLI_COMMANDS_PARAM);
        ms.log('SSHTerminalCommand: init - cli_commands = ' + cliCommands);
        if(cliCommands.trim())
        {
            var arrCliCommands = cliCommands.split(';');
            this.runCommands(arrCliCommands);
        }
        
    },
    
    /**
     * Logs out of the SSHProvider connected to cli device and creates the output result records when
     * we weren't able to connect so the error that is set gets propagated properly
     */
    cleanup : function() {
        
        if (this.createOutputRecord)
            this.createOutputResult(this.output);
    },
    
    getCommandExecuter : function() {
		
		ms.log('SSHTerminalCommand: getCommandExecuter');
		ms.log('SSHTerminalCommand: getCommandExecuter - source = ' + this.source);
        
		var sshProvider = null;
        
		try {
            var providerFactory = new DiscoveryProviderFactory();
            sshProvider = providerFactory.create(ProviderType.SSH, null, this.source, null);
			sshProvider.setHost(this.source);
			sshProvider.setUseSncssh(false);
            this.debug('Attempting to connect');
        } catch (ex) {
            this.setError("Unable to establish connection " + ex);
            return null;
        }
        	
        return sshProvider;
    },
           
    type: "SSHTerminalCommand"
});
