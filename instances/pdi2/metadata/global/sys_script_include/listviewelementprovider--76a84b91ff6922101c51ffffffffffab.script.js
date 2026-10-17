class ListViewElementProvider {
	
    /**
     * The Approach is modeled after https://code.devsnc.com/dev/glide/blob/master/glide-ng/src/main/java/com/glide/ui/list/TableLayoutService.java
     * @description This function returns the list view accessible columns by table.
     * The order of precedence is:
     * 1. The personalized list view accessible columns for the table for that user
     * 2. The user's list view accessible columns view defined by List Rules
     * 3. The default list view accessible columns for the table for that user
     * @param {string} tableName - The name of the table to get the list view accessible columns for.
     * @returns {Array<string>} - An array of list view accessible column names for the specified table.
     */
    static getListViewAccessibleColumnsByTable(tableName) {
        const sysList = new GlideSysList(tableName);
        const viewResolver = new GlideNGViewResolver();
        var resolvedView = viewResolver.getListView(tableName, null);
        sysList.setViewName(resolvedView);
        return sysList.getAccessList(null); // Get the list of accessible columns for the table
    }
}
