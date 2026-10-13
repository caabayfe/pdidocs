function include({ imports }) {
    const QUERY_OPS = ["NEW_QUERY", "OR", "AND", "IN_WHICH", "THAT_HAS"];
    const QUERY_FIELDS = ["field", "operator", "conditionValue"];
    const COMPARISONTYPE = "comparisonType";
    const NEW_QUERY = "NEW_QUERY";

    const _getReadableQueryRows = (model, readableRows = []) => {
        if (!model || !Array.isArray(model))
            return readableRows;

        model.forEach((qRow) => {
            if (qRow[COMPARISONTYPE] !== NEW_QUERY)
                readableRows.push(qRow[COMPARISONTYPE]);

            let _thisRowQuery = QUERY_FIELDS.map((field) => {
                // If no display value, return 'internal' value
                return qRow[field]["display"] || qRow[field]["internal"];
            }).join(" ");

            if (qRow.children && qRow.children.length > 0) {
                const _subQueries = _getReadableQueryRows(qRow.children);
                _thisRowQuery = [_thisRowQuery, ..._subQueries];
            }

            readableRows.push(_thisRowQuery);
        });

        return readableRows;
    };

    const _getRichTextQueryRows = (readableQueryRows) => {
        if (!Array.isArray(readableQueryRows)) return [];

        return readableQueryRows.map((query) => {
            return QUERY_OPS.indexOf(query) >= 0
                ? _getRowSeparator(query)
                : _getFormattedRow(query);
        });
    };

    const _getFormattedQuery = (query, index) => {
        return index % 2 != 0 
            ? `&nbsp;<span> ${query} </span>&nbsp;` 
            : query;
    };

    const _getFormattedRow = (fQuery) => {
        if (Array.isArray(fQuery))
            fQuery = fQuery.map(_getFormattedQuery).join(" ");

        return `<style>
                    p { margin : 0 0 .25rem; font-size: 1rem;} 
                    p span { color: #5F5DBB; border: 1px solid #D1D6D6; border-radius: 2px;}
                </style>
                <p>${fQuery}</p>`;
    };

    const _getRowSeparator = (operator) => {
        return `<style> 
                    p { text-align: center; border-bottom: 1px solid #ACB4B5; line-height: 0.01rem; margin: 0 0 .25rem} 
                    p span { color: #ACB4B5; background:#fff; padding:0 1rem; }
                </style>
                <p><span>${operator}</span></p>`;
    };

    return {
        getPreviewData: function (comparisonModel) {
            const readableQueryRows = _getReadableQueryRows(comparisonModel);
            const richTextRows = _getRichTextQueryRows(readableQueryRows) || [];

            const richTextData = {
                items: richTextRows.map((richTextContent) => {
                    return {
                        template: "now-rich-text",
                        propValues: {
                            html: richTextContent,
                        },
                    };
                }),
            };

            return richTextData;
        },
    };
}
