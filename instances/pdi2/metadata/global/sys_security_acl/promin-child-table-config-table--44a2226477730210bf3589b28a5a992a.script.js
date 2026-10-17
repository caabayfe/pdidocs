var grProcessDef = current.process_def.getRefRecord();
var answer = current.isNewRecord() && grProcessDef.canWrite();
answer;
