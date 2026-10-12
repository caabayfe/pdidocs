answer = !new global.ProminACLUtil(parent.project.getRefRecord()).canWriteInChildTableDef() 
			|| parent.source_type == "AGENTIC_AI_DATA";
