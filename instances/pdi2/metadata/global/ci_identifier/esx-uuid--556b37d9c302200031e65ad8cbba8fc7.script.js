function(ciData, log, identifier) { 
   var uuid = ciData.getData().correlation_id;
   var matches = [];
   
   if(!uuid)
	  return new CIIdentifierResult(matches, false);
   
   var gr = new GlideRecord(identifier.applies_to);
   gr.addQuery('correlation_id', ciData.getData().correlation_id);
   gr.query();
   
   while (gr.next())
	  matches.push('' + gr.getUniqueValue());
   
   return new CIIdentifierResult(matches, true);
}
