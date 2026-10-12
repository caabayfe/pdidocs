gs.log("Calling ProminMLSolutionFailureHandler for "+event.getUniqueValue());
SNC.ProcessOptimization.handleMLSuccessfulTrainingEvent(event.instance,false); 
gs.log("Finished ProminMLSolutionFailureHandler for "+event.getUniqueValue());
