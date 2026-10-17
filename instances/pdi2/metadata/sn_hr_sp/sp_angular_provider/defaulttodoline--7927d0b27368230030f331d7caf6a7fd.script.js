function defaultTodoLine() {
	return {
		template :  '<div class="default-todo-line panel b {{tagId}}">' +
					'  <span ng-if="caption">' +
					'    <h4 class="todo-action-caption">{{caption}}</h4>' +
					'  </span> ' +
					'  <span ng-if="state">' +
					'    <div class="todo-action-state">${State} {{state}} </div> ' +
					'  </span> ' +
					'  <span ng-if="timestamp && !completedBy && !created" class="status">' + 
					'    ${Completed} <sn-time-ago timestamp="timestamp" />' +
					'  </span>' +
					'  <span ng-if="timestamp && completedBy && !created" class="status">' + 
					'    ${Completed by } {{completedBy}} <sn-time-ago timestamp="timestamp" />' +
					'  </span>' +
					'  <span ng-if="timestamp && created" class="status">' + 
					'    ${Created} <sn-time-ago timestamp="timestamp" />' +
					'  </span>' +
					'  <span ng-if="link && linkCaption">' +
					'    <h5><a href="{{link}}" target="_blank">{{linkCaption}}</a></h5>' +
					'  </span>' +
					'</div>',
		restrict :  'E',
		replace :   true,
		scope :     {
						timestamp : "=",
						completedBy : "@",
						created : "@",
						caption : "@",
						state: "@",
						link : "@",
						linkCaption : "@", 
						tagId : "@"
					},
		link :      function(scope) {
						if(!scope.tagId)
							scope.tagId = 'task-completed';
					}
	};
}
