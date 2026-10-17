var QB_SUGGESTED_REL_CLEANUP_JOB = "CMDB Query Builder Suggested Rels Cleanup SysTrigger";
var QB_SUGGESTED_REL_CLEANUP_SCRIPT = "SNC.QueryBuilderSuggestedRelationships.cleanupQueryBuilderSuggestedRels();";

SNC.QueryBuilderSuggestedRelationships.deleteInvalidSuggestedRels();
SNC.QueryBuilderSuggestedRelationships.createSuggestedRelsSysTrigger(QB_SUGGESTED_REL_CLEANUP_JOB, QB_SUGGESTED_REL_CLEANUP_SCRIPT);
