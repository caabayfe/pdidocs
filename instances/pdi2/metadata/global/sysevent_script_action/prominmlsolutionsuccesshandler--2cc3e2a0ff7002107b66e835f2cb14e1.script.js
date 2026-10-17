gs.log("Calling ProminMLSolutionSuccessHandler for "+event.getUniqueValue());  
SNC.ProcessOptimization.handleMLSuccessfulTrainingEvent(event.instance,true);
gs.log("Finished ProminMLSolutionSuccessHandler for "+event.getUniqueValue());
