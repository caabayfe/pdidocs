(function(payload, attrsWithTruncationEnabled, provider, remainingTokens) {
    /* write code here to truncate attributes.*/
    return new sn_wwna.WWNAConfigImpl(payload.document_table, payload.document_sys_id, payload.skill_id).addTruncation(payload, attrsWithTruncationEnabled, provider, remainingTokens);
})(payload, attrsWithTruncationEnabled, provider, remainingTokens);
