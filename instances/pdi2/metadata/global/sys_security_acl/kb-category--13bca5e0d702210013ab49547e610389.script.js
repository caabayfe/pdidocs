if(current.parent_id)
	answer = new KBCategory().canRead(current.parent_id);
else
	answer = true;
