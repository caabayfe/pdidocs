/**
 * Create a list of user filters for the current table
 */

addEditFilter();

function addEditFilter() {
   // Edit Personal Filters
   title = gs.getMessage('Edit Personal Filters');
   g_contextMenu.addAction('--personal--', '<span>' + title + '</span>', 'editPersonalFilters();', 0);
}
