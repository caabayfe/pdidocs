function include({ imports }) {
    const filterAndMapList = (list = [], filterValue = "") =>
        list.filter(item =>
            !filterValue ||
            (item.displayValue && item.displayValue.toLowerCase().includes(filterValue.toLowerCase()))
        ).map(item => ({
            id: item.value,
            label: item.displayValue
        }));

    return {
        filterAndMapList: filterAndMapList
    };
}
