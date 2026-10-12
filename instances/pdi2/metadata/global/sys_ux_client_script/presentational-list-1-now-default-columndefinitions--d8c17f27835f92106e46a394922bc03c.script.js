function evaluateProperty({api, helpers}) {
  // Accessing the columns array from the API response
  const columns = api.data.list_controller_4.columnDefinitions.columns;

  // Map over the columns to return them in the required format
  const formattedColumns = columns.map(column => ({
    icons: column.icons || { endIcons: [] },  // Use existing icons or provide an empty array as fallback
    key: column.key,                          // Extract the column key
    label: column.label,                      // Extract the column label
    type: column.type                         // Extract the column type
  }));

  // Return the formatted columns
  return {
    columns: formattedColumns
  };
}
