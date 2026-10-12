function getStatus(status) {
    if (status == "error") 
		return 0;
    else if (status == "success") 
		return 1;
    return 2;
};

getStatus(current.status);
