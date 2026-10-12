(function executeRule(current, previous /*null when async*/ ) {
    current.script = "try {\n\tSNC.ProcessOptimization.executeScheduledJob(current.getUniqueValue());\n}catch (error){\n\tgs.error(error.getMessage());\n}";
})(current, previous);
