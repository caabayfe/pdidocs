function transform(input) {
    const groupDetails = new sn_km_gen_ai.KnowledgeGap().groupDetailsForQuery(input?.query, "gap_resolved");
    return new sn_km_gen_ai.KnowledgeGap().checkClusterCanBeResolved(groupDetails);
}
