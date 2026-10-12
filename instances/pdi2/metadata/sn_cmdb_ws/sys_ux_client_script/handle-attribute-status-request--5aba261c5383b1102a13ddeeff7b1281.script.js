function script({
    api,
    event
}) {
    const {
        columnDefinitions,
        rowDefinitions
    } = event.payload;

    let payloadIds = rowDefinitions.rows.flatMap((row) => {
        if (row.type == 'grouped') {
            return row.children.map(c => c.key);
        } else {
           return row.key;
        }
    });

    let rowCells = {};
    rowDefinitions.rows.forEach((row) => {
        if (row.type == 'grouped') {
            row.children.forEach(c => {
                rowCells[c.key] = c.cells;
            });
        } else {
            rowCells[row.key] = row.cells;
        }
    });

    api.setState('documentIds', payloadIds);
    api.setState('columnDefinitions', JSON.parse(JSON.stringify(columnDefinitions)));
    api.setState('rowDefinitions', JSON.parse(JSON.stringify(rowDefinitions)));
    api.setState('rowCache', ({currentValue}) => {
        return {...currentValue, ...rowCells};
    });
}
