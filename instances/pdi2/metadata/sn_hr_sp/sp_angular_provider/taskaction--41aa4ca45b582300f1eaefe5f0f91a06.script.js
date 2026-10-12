function taskAction() {
	return {
    template: '<div class="hr-task-action panel b {{tagId}}">' +
      '  <span ng-if="caption">' +
      '    <div class="task-action-caption">{{caption}}</div>' +
      '    <div class="task-action-small-caption">' +
	  '       <sp-html-content style="margin: 0; padding: 0;" ng-if="codeTag === \'true\'" model="smallCaption"></sp-html-content>' +
      '      <div ng-if="codeTag === \'false\'">{{smallCaption}}</div>' +
      '    </div>' +
      '  </span> ' +
      '  <span ng-if="timeStamp && !completedBy && !created" class="status">' +
      '    ${Completed} <sn-time-ago timeStamp="timeStamp" />' +
      '  </span>' +
      '</div>',

    restrict: 'E',
    replace: true,
    scope: {
      timeStamp: "@",
      completedBy: "@",
      created: "@",
      caption: "@",
      shortDescription: "@",
      smallCaption: "@",
      codeTag: "@",
      link: "@",
      linkCaption: "@",
      tagId: "@"
    },

    link: function (scope) {
      if (!scope.tagId) {
        scope.tagId = 'task-completed';
      }
    }
  };
}
