function link(scope, element) {
    var isTodoListItem = function(target) {
        return target.hasClass('todos-list');
    };
    /**
     * Handler for pressing the up/down arrows to navigate the list
     * @param {AngularDOMEvent} event - the angular DOM event
     */
    scope.handleListKeyNavigation = function (event) {
        var DOWN_KEY_CODE = 40;
        var UP_KEY_CODE = 38;

        var target = angular.element(event.target);
        var nextTodoListItem;

        if (event.keyCode === DOWN_KEY_CODE) {
            if (isTodoListItem(target)) {
                nextTodoListItem = target.next();
                // If this is the bottom of the list, try to return to the top
                if (nextTodoListItem.length === 0)
                    nextTodoListItem = angular.element(element).find('ul.tab-pane.active li:first-of-type');

                // If there is no top item, return
                if (nextTodoListItem.length === 0)
                    return;

                // Remove the tab index on the currently-focused item
                target.attr('tabindex', '-1');

                // Add a tab index to the next item and focus on it. 
                // (With special handling for the 'Show more' button)
                if (nextTodoListItem.hasClass('load-more-button'))
                    nextTodoListItem.find('button').focus().attr('tabindex', '0');
                else
                    nextTodoListItem.focus().attr('tabindex', '0');
            } else if (event.target.tagName.toLowerCase() === 'button') {
                // If this is the "Show more" button, try to return to the top
                nextTodoListItem = angular.element(element).find('ul.tab-pane.active li:first-of-type');
                // If there is no top item, return
                if (nextTodoListItem.length === 0)
                    return;

                // Remove the tab index on the currently-focused item
                target.attr('tabindex', '-1');

                nextTodoListItem.focus().attr('tabindex', '0');
            }
        } else if (event.keyCode === UP_KEY_CODE) {
            if (isTodoListItem(target)) {
                var previousTodoListItem = target.prev();
                // If this is the top of the list, try to go to the bottom.
                if (previousTodoListItem.length === 0) {
                    // First try to go to the show more button.
                    previousTodoListItem = angular.element(element).find('ul.tab-pane.active li.load-more-button button');
                    // If the show more button isn't there, try to go to the last to-do in the list
                    if (previousTodoListItem.length === 0)
                        previousTodoListItem = angular.element(element).find('ul.tab-pane.active li.todos-list:last-of-type');
                    // If there is no last to-do, return
                    if (previousTodoListItem.length === 0)
                        return;
                }
                // Remove the tab index on the currently-focused item
                target.attr('tabindex', '-1');

                // Add a tab index to the previous item and focus on it
                previousTodoListItem.focus().attr('tabindex', '0');
            } else if (event.target.tagName.toLowerCase() === 'button') {
                // In the 'Show more' button scenario, remove the tabindex from the button
                angular.element(event.target).attr('tabindex', '-1');
                // Focus on the last item in the list and give it a tab index
                target.parent().prev().focus().attr('tabindex', '0');
            }
        }
    };

    /**
     * Invoked after loadData is called in the client script. 
     * (Not invoked after clicking "Show more". See the focusAfterLoadMore function)
     */
    scope.handleTabIndexesAfterLoad = function () {
        var listItems = angular.element(element).find('ul.tab-pane.active li');
        // If there are no list items, return
        if (listItems.length === 0)
            return;

        // Enable tab index on the first list item
        angular.element(listItems[0]).attr('tabindex', '0');

        // Remove timeago tabindexes (they break the tabbing behavior)
        angular.element(element).find('.todo-summary-body sn-time-ago time').attr('tabindex', '-1');
    };
		
    /**
     * Invoked after to-do line item widget is loaded (from user clicking on left-panel tasks)
     */
    scope.handleTabIndexesAfterWidgetLoad = function () {
        var timespans = angular.element('.task-content sn-time-ago time');

        // If there are no list items, return
        if (timespans.length === 0)
            return;

        // Remove timeago tabindexes (they break the tabbing behavior)
        for (var i = 0; i < timespans.length; i++)
          angular.element(timespans[i]).attr('tabindex', '-1');
    };

    /**
     * Invoked after processGetMoreTodos is called in the client script (from user clicking "Show more")
     */
    scope.focusAfterLoadMore = function (todoElementId) {
        // After clicking the "Load more" button, remove its tab index
        angular.element(element).find('.load-more-button button').attr('tabindex', '-1');

        // Wait a tick for the new list items to render
        scope.$timeout(function () {
            // Focus on the first todo that was added to the list (if id is provided)
            if (todoElementId != null)
                angular.element(element).find('#' + todoElementId).focus().attr('tabindex', '0');
            // Otherwise, focus on the last todo in the whole list
            else
                angular.element(element).find('ul.tab-pane.active li:last-of-type').focus().attr('tabindex', '0');
            // Remove timeago tabindexes from completed todos (they break the tabbing behavior)
            angular.element(element).find('.todo-summary-body sn-time-ago time').attr('tabindex', '-1');
        });
    };

    /**
     * Invoked after a to-do is opened
     * @param {String} todoSysId - the sys id of the todo that was opened
     */
    scope.handleTabIndexesAfterTodoOpened = function (todoSysId) {
        // Remove tabindex from whatever previously had focus and add tabindex to currently selected todo
        angular.element(element).find('ul.tab-pane.active li[tabindex=0]').attr('tabindex', '-1');
        angular.element('#' + todoSysId + '_task_lineitem_summary').attr('tabindex', '0');
    };
}
