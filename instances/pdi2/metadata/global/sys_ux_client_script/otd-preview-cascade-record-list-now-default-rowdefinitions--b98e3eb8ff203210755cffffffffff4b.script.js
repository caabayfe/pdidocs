/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let rows = api.data.rule_management_dmc.previewCascadeData?.rows;
    const { previewCascadeCurrentPage: currentPage, previewCascadeRowsPerPage: rowsPerPage } = api.state;
    if(!rows) return {rows: []};
    rows = rows.map((row) => {
        return {
            cells: {
                preview_record_count: {
                    value: row["preview_record_count"]
                },
                actual_record_count: {
                    value: row["actual_record_count"]
                },
                table: {
                    value: row["table"]
                }, 
                sys_created_on: {
                    value: row["sys_created_on"]
                }, 
                sys_created_by: {
                    value: row["sys_created_by"]
                }
            },
            key: row.sys_id
        };
    });

    const startIndex = currentPage * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, rows.length);

    return {
        rows: rows.filter((obj, index) => {
            return index >= startIndex && index < endIndex;
        })
    };
}
