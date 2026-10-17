function transform(input) {
if (!input.sysIds) {
  return false;
}
var result = new sn_km_gen_ai.KnowledgeGap().markArticleCreated(input.sysIds);
return true;
}
