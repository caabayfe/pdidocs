var knowledgeSecurityManager = new KnowledgeSecurityManager();
// Create an array of user sys_ids to verify manager roles
var currentManagers = current.kb_managers.split(",");
if (currentManagers != undefined)
	currentManagers.push(current.owner);
else currentManagers = [current.owner];

var previousManagers = previous.kb_managers.split(",");
if (previousManagers != undefined) 
	previousManagers.push(previous.owner) 
else previousManagers = [previous.owner];

knowledgeSecurityManager.updateKnowledgeManagers(currentManagers, previousManagers);
