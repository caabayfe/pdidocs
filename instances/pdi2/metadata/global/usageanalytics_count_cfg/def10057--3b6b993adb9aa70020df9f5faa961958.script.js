var versioningInstalled = new SNC.KnowledgeHelper().isVersioningInstalled();
if(versioningInstalled){
	answer = (new SNC.KnowledgeHelper().isVersioningEnabled())? 0:1;
}
else 
answer = 0;
