function script({api, event}) { 
    if (event.payload.errror)
        console.error("event threw error, event: " + event.id + " payload error: " + event.payload.error);
    else
        console.error("unknown error from Data Manager Policy Form controller");
 }
