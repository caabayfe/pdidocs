function transform(input) {
    var searchResults = input.searchResults;
    if (!searchResults) {
        gs.error('No search results input provided to "Transform Search Response to EVAM Format" data broker - returning empty list');
        return {
            searchResults: []
        };
    }
    var transformedSearchResults = searchResults.map(function(result) {
        var columns = [];
        if (result.columns) {
            columns = result.columns.map(function(column) {
                return {
                    fieldName: column.fieldName,
                    value: column.displayValue
                };
            });
        }
        columns.push({
            fieldName: 'ais_doc_id',
            value: result.aisDocId
        });
        columns.push({
            fieldName: 'ai_search_teaser_title',
            value: result.title
        });
        columns.push({
            fieldName: 'ai_search_teaser_text',
            value: result.text
        });
        columns.push({
            fieldName: 'document_index',
            value: result.documentIndex
        });
        columns.push({
            fieldName: 'navigation_url',
            value: result.url
        });
        columns.push({
            fieldName: 'record_class_name',
            value: result.recordClassName
        });
        columns.push({
            fieldName: 'table_label_singular',
            value: result.tableLabelSingular
        });
        columns.push({
            fieldName: 'table_label_plural',
            value: result.tableLabelPlural
        });
        columns.push({
            fieldName: 'child_docs',
            value: result.childDocs
        });
        columns.push({
            fieldName: 'semantic_embedding',
            value: result.semanticEmbedding
        });
        columns.push({
            fieldName: 'semantic_similarity',
            value: result.semanticSimilarity
        });

        return {
            sys_id: result.sysId,
            table: result.table,
            columns: columns
        };
    });

    return {
        searchResults: transformedSearchResults
    };
}
