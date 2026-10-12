(function(current, action){
var result = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
})(current, action);
