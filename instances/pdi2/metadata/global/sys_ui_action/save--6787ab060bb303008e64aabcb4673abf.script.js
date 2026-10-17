
answer = current.insert();

//handle M2M Inserts
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
