var DockerErrorHandler = Class.create();
DockerErrorHandler.prototype = {
    initialize: function() {},
    // Function to fetch error messages
    retrieveErrorMessage: function(code) {
        var errorCodeMsgs = {
            "image_does_not_exist": "Chosen image does not exist.",
            "unexpected_error": "Unexpected error has occurred. Please check the response received from the api for more details.",
            "invalid_network_name": "Network name must be valid as a DNS name component.",
            "network_plugin_not_found": "Network plugin driver not found.",
            "forcefully_leave_swarm": "You are attempting to leave the swarm on a node that is participating as a manager. Removing the last manager erases all current state of the swarm. Set input 'force' to true to ignore this message."
        };
        for (var key in errorCodeMsgs) {
            if (key == code) {
                return errorCodeMsgs[key];
            }
        }
    },


    dockerErrorParser: function(response) {
        try {
            return JSON.parse(response).message;
        } catch (err) {}
    },

    // Function for all common errors related to actions
    genericErrorHandler: function(inputs, outputs) {
        outputs.status = false;

        if (inputs.status_code == '401') {
            outputs.error_message = this.retrieveErrorMessage(
                'unauthorized');
        } else if (inputs.status_code == '403') {
            outputs.error_message = this.retrieveErrorMessage(
                'permissions');
        } else {
            if (inputs.response) {
                outputs.error_message = this.boxErrorParser(inputs
                    .response);
            }
        }

        if (!outputs.error_message) {
            outputs.error_message =
                "Unexpected error occurred. Please check the response received from the api for more details.";
        }

        return outputs;
    },

    // Create Container Error Handler
    createContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Bad parameter";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such container";
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: conflict";
                break;
            case "500":
                if (inputs.response.indexOf(
                        'cannot unmarshal string') != -1 && inputs.response
                    .indexOf('Volumes') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for the Volumes variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal array') != -1 && inputs
                    .response
                    .indexOf('Volumes') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for the Volumes variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal array') != -1 && inputs
                    .response
                    .indexOf('HostConfig') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for the Host Config variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal array') != -1 && inputs
                    .response
                    .indexOf('Healthcheck') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for the Healthcheck variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal array') != -1 && inputs
                    .response
                    .indexOf('NetworkingConfig') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for the Networking Config variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal string') != -1) {
                    outputs.error_message =
                        "Invalid value provided in input variables, kindly check and try again.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: server error";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Start a Container Error Handler
    startContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "409":
                if (inputs.response.indexOf(
                        'cannot start a paused container') != -1) {
                    outputs.error_message =
                        'Can not start container which is in paused state.';
                }
                break;

            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: No such container";
                break;
            case "304":
                outputs.error_message =
                    "Cannot start container as the container is already running.";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Stop a Container Error Handler
    stopContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            case "304":
                outputs.error_message =
                    "Cannot stop container as the container is already stopped.";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Restart a Container Error Handler
    restartContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Kill a Container Error Handler
    killContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        'Provided container ID is invalid.';
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such container";
                }
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Container is not running";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Invalid value";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Remove a Container Error Handler
    removeContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Bad parameter";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such container";
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Conflict";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Create an Exec Error Handler
    createExecInstanceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such container";
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Container is paused";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },
    // Start an Exec Instance Error Handler
    startExecInstanceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "200":
                if (inputs.response.indexOf('exec failed') != -1) {
                    outputs.error_message =
                        "Could not start the Exec as Exec was created with invalid command.";
                } else if (inputs.response.indexOf('has already run') !=
                    -1) {
                    outputs.error_message =
                        "Execution instance Id is already used.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "200: OCI runtime exec failed";
                }
                break;
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided execution ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such exec instance";
                }
                break;
            case "409":
                if (inputs.response.indexOf("has already run") != -1) {
                    outputs.error_message =
                        "409: Execution instance Id is already used.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "409: Container is stopped or paused";
                }
                break;
            case "500":
                if (inputs.response.indexOf("not running") != -1) {
                    outputs.error_message =
                        "Attached container is not running.";
                } else if (inputs.response.indexOf("exec failed") != -
                    1) {
                    outputs.error_message =
                        "500: Could not start the Exec as Exec was created with invalid command.";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Inspect an Exec Instance Error Handler
    inspectExecInstanceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf("page not found") != -1) {
                    outputs.error_message =
                        "Provided execution id is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such exec instance";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Inspect a Container Error Handler
    inspectContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "200":
                if (inputs.container_id == "") {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                }
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such container";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // List Containers Error Handler
    listContainersErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.

        outputs.status = "Error";
        switch (String(inputs.status_code)) {
            case "500":
                if (inputs.response && (inputs.response.indexOf(
                            "invalid character") != -1 || inputs
                        .response.indexOf("cannot unmarshal") != -1))
                    outputs.error_message =
                    "Provided value for Filter input is invalid or of incorrect format.";


            default:
                if (!outputs.error_message)
                    outputs.error_message = inputs.response ? this
                    .dockerErrorParser(inputs
                        .response) : this.retrieveErrorMessage(
                        'unexpected_error');
        }


        if (!outputs.error_message) {
            outputs.error_message = this.retrieveErrorMessage(
                'unexpected_error');
        }

        return outputs;
    },

    // Rename a Container Error Handler
    renameContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                if (inputs.response.indexOf('Invalid container name') !=
                    -1) {
                    outputs.error_message =
                        "Provided container name is invalid for renaming a container.";
                } else if (inputs.response.indexOf(
                        'Renaming a container with the same name') != -
                    1) {
                    outputs.error_message =
                        "Renaming a container with the same name is prohibited.";
                } else if (inputs.response.indexOf(
                        'Neither old nor new names may be empty') != -
                    1) {
                    outputs.error_message =
                        "Provided new name can not be empty.";
                }
                break;
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Name already in use";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },


    // Pause a Container Error Handler
    pauseContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
                // undocumented
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Container is already paused";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Unpause a Container Error Handler
    unpauseContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },


    // Unpause a Container Error Handler
    waitForContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Update a Container Error Handler
    updateContainerErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Invalid Input value.";
                break;
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided container ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Bad parameter";
                }
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Cannot update container.";
                break;
            case "500":
                if (inputs.response.indexOf(
                        'cannot unmarshal number') != -1 && inputs.response
                    .indexOf('type int64') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid integer value entered for input variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal') != -1 && inputs.response
                    .indexOf('ThrottleDevice') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for Block IO Device Read Bps or Block IO Device Write Bps or Block IO Device Read IOps or Block IO Device Write IOps variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'json: cannot unmarshal object') != -1 && inputs
                    .response.indexOf('DeviceCgroupRules') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for Device Cgroups Rule variable, kindly check and try again.';
                } else if (inputs.response.indexOf(
                        'cannot unmarshal') != -1 && inputs.response
                    .indexOf('WeightDevice') != -1) {
                    outputs.error_message =
                        'Incorrect or Invalid value entered for Block IO Weight Device variable, kindly check and try again.';
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // List Images Error Handler
    listImagesErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "500":
                if (inputs.response.indexOf('json: cannot unmarshal') !=
                    -1) {
                    outputs.error_message =
                        "Filter values provided is invalid or of incorrect format.";
                } else if (inputs.response.indexOf(
                        'invalid character') != -1) {
                    outputs.error_message =
                        "Filter values provided is invalid or of incorrect format.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Invalid filter values";
                break;
            case "404":
                if (inputs.response.indexOf('No such image') != -1) {
                    outputs.error_message =
                        "Filter values provided is invalid or of incorrect format or no such image available.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Invalid filter values";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Search Images Error Handler
    searchImagesErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "500":
                if (inputs.response.indexOf('out of range') != -1) {
                    outputs.error_message =
                        "Provided range is invalid.";
                } else if (inputs.response.indexOf(
                        'json: cannot unmarshal string') != -1) {
                    outputs.error_message =
                        "Filter values provided is invalid or of incorrect format.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Invalid filter values";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // List Networks Error Handler
    listNetworksErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Bad Request";
                break;
            case "500":
                if ((inputs.response.indexOf('invalid character') != -
                        1) || (inputs.response.indexOf(
                        'cannot unmarshal') != -1)) {
                    outputs.error_message =
                        "Provided filter key is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Create Image Error Handler
    createImageErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if ((inputs.response.indexOf('manifest') != -1) && (
                        inputs.response.indexOf(
                            'not found') != -1)) {
                    outputs.error_message =
                        "Image name or Image name-tag combination to pull not found.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Repository does not exist or no read access";
                }
                break;
            case "400":
                if (inputs.response.indexOf(
                        'invalid reference format') != -1) {
                    outputs.error_message =
                        "One or more provided inputs are invalid.";
                } else if (inputs.response.indexOf(
                        'incorrect username or password') != -1) {
                    outputs.error_message =
                        "User unauthorized: incorrect username or password.";
                } else if (inputs.response.indexOf(
                        'invalid character') != -1) {
                    outputs.error_message =
                        "One or more provided inputs are invalid.";
                } else if (inputs.response.indexOf(
                        'invalid URL escape') != -1) {
                    outputs.error_message =
                        "One or more provided inputs are invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            case "500":
                if (inputs.response.indexOf('no Host in request URL') !=
                    -1) {
                    outputs.error_message =
                        "One or more necessary inputs not provided.";
                } else if (inputs.response.indexOf(
                        'incorrect username or password') != -1) {
                    outputs.error_message =
                        "User unauthorized: incorrect username or password.";
                } else if ((inputs.response.indexOf('no such host') != -
                        1) || (inputs.response
                        .indexOf('http://http') != -1)) {
                    outputs.error_message =
                        "One or more provided inputs are invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            case "200":
                if (inputs.response.indexOf(
                        'Error processing tar file') != -1) {
                    outputs.error_message =
                        "Incorrect/Invalid docker image link provided or Error processing tar file.";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Remove Image Error Handler
    removeImageErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                if (inputs.response.indexOf(
                        'invalid reference format') != -1) {
                    outputs.error_message =
                        "Provided image ID is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Image name cannot be blank";
                }

                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such image";
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Conflict";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },


    // Inspect Network Error Handler
    inspectNetworkErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "200":
                if (inputs.network_id == "") {
                    outputs.error_message =
                        "Provided Network ID is invalid.";
                }
                break;
            case "400":
                outputs.error_message =
                    "Multiple networks are present with provided name.Use network ID instead of name.";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404:Network not found";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Create Network Error Handler
    createNetworkErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = (inputs.response && inputs
                        .response.indexOf(
                            'name must be valid as a DNS name component'
                        ) != -1) ? this
                    .retrieveErrorMessage('invalid_network_name') : (
                        JSON.parse(inputs.response))
                    .message;
                break;
            case "403":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "403: Operation not supported for pre-defined networks";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message : this
                    .retrieveErrorMessage('network_plugin_not_found');
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Network already exists";
                break;
            case "500":
                if ((inputs.response.indexOf(
                        "cannot unmarshal number") != -1) && (inputs
                        .response
                        .indexOf("IPAM") != -1)) {
                    outputs.error_message =
                        "Provided IPAM value is invalid.";
                } else if ((inputs.response.indexOf(
                        "cannot unmarshal number") != -1) && (inputs
                        .response.indexOf("Options") != -1)) {
                    outputs.error_message =
                        "Provided Options value is invalid.";
                } else if ((inputs.response.indexOf(
                        "cannot unmarshal number") != -1) && (inputs
                        .response.indexOf("Labels") != -1)) {
                    outputs.error_message =
                        "Provided Labels value is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server error";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Remove Network Error Handler
    removeNetworkErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "403":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "403: Operation not supported for pre-defined networks";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such network";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // List Volumes Error Handler
    listVolumesErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {

            case "400":
                if (inputs.response.indexOf('Invalid filter') != -1) {
                    outputs.error_message = JSON.parse(inputs.response)
                        .message;
                } else if (inputs.response.indexOf(
                        'error reading volume filters') != -1) {
                    outputs.error_message =
                        "Filter values provided is invalid or of incorrect format.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Invalid input.";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Inspect a Volume Error Handler
    inspectVolumeErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('no such volume') != -1) {
                    outputs.error_message =
                        "Provided Volume Name not found.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such volume";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Create a Volume Error Handler
    createVolumeErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {

            case "400":
                if (inputs.response.indexOf('invalid option key') != -
                    1) {
                    outputs.error_message =
                        "Provided key for Driver Options input is invalid.";
                } else if (inputs.response.indexOf(
                        'invalid characters for a local volume name') !=
                    -
                    1) {
                    outputs.error_message = "Provided Name is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Invalid driver key.";
                }
                break;
            case "409":
                if (inputs.response.indexOf(
                        'volume name must be unique') != -1) {
                    outputs.error_message =
                        "Provided Name already exists.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "409: Volume name already exists.";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            case "404":
                if (inputs.response.indexOf(
                        'error looking up volume plugin') != -1) {
                    outputs.error_message =
                        "Provided Driver not found.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: Plugin not found.";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Remove a Volume Error Handler
    removeVolumeErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('no such volume') != -1) {
                    outputs.error_message =
                        "Provided Volume Name not found.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such volume or volume driver";
                }
                break;
            case "409":
                if (inputs.response.indexOf('volume is in use') != -1) {
                    outputs.error_message =
                        "Volume is in use and cannot be removed.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "409: Volume is in use and cannot be removed";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // List Services Error Handler
    listServicesErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {

            case "400":
                if ((inputs.response.indexOf(
                        'json: cannot unmarshal') != -1) || (inputs
                        .response
                        .indexOf('invalid character') != -1) || (inputs
                        .response.indexOf(
                            'unexpected end') != -1)) {
                    outputs.error_message =
                        "Filter values provided is invalid or of incorrect format.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Invalid filter values";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Inspect Service Error Handler
    inspectServiceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided 'Service ID/Name' is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such Service";
                }
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Create Service Error Handler
    createServiceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                if ((inputs.response.indexOf(
                        'name must be valid as a DNS name component'
                    ) != -1)) {
                    outputs.error_message =
                        "Provided Service Name is Invalid.";
                } else if ((inputs.response.indexOf(
                        'is already in use by service') != -1)) {
                    outputs.error_message =
                        "Provided published port in Endpoint Specification is already in use by other service.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Bad parameter";
                }
                break;
            case "403":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "403: Network is not eligible for services";
                break;
            case "409":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "409: Name conflicts with an existing service";
                break;
            case "500":
                if ((inputs.response.indexOf(
                            'name conflicts with an existing object') !=
                        -1)) {
                    outputs.error_message =
                        "Provided Service Name already exist.";
                } else if ((inputs.response.indexOf(
                        'json: cannot unmarshal object') != -1)) {
                    outputs.error_message =
                        "Networks value provided is invalid or of incorrect format.";
                } else if ((inputs.response.indexOf(
                        'json: cannot unmarshal number') != -1)) {
                    outputs.error_message =
                        "JSON provided for Task Template input is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server Error";
                }
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Delete Service Error Handler
    deleteServiceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such service";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Update Service Error Handler
    updateServiceErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                if ((inputs.response.indexOf(
                        'does not have a previous spec') != -1)) {
                    outputs.error_message =
                        "Provided service does not have previous spec to rollback.";
                } else if ((inputs.response.indexOf(
                        'not a valid repository/tag') != -1)) {
                    outputs.error_message =
                        "Provided base image in container specification is not valid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Bad parameter";
                }
                break;
            case "404":
                if (inputs.response.indexOf('page not found') != -1) {
                    outputs.error_message =
                        "Provided 'Service ID/Name' is invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "404: No such service";
                }
                break;
            case "500":
                if ((inputs.response.indexOf(
                        'update out of sequence') != -1)) {
                    outputs.error_message =
                        "Check service version and try again.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server Error";
                }
                break;
            case "501":
                if ((inputs.response.indexOf(
                        'service mode change is not allowed') != -1)) {
                    outputs.error_message =
                        "Service Mode cannot be updated.";
                } else if ((inputs.response.indexOf(
                        'renaming services is not supported') != -1)) {
                    outputs.error_message =
                        "Service cannot be renamed.";
                }
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },
    // Initialize Swarm Error Handler
    initSwarmErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Bad parameter";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is already part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Join Existing Swarm Error Handler
    joinExistingSwarmErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "400: Bad parameter";
                break;
            case "500":
                if (inputs.response.indexOf('no such host') != -1) {
                    outputs.error_message =
                        "Provided Remote Addresses are invalid.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "500: Server Error";
                }
                break;
            case "503":
                if (inputs.response.indexOf(
                        'connect: connection refused') != -1 && inputs
                    .response
                    .indexOf(
                        'transport: Error while dialing dial tcp') != -1) {

                    outputs.error_message = (JSON.parse(inputs
                            .response)["message"].substring(JSON
                            .parse(inputs.response)["message"]
                            .indexOf('Error while dialing')))
                        .replace('"', '');
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "503: Node is already part of a swarm";
                }
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Leave Swarm Error Handler
    leaveSwarmErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = (inputs.response && inputs
                    .response.indexOf(
                        "Use `--force` to ignore this message.") !=
                    -1) ? this.retrieveErrorMessage(
                    'forcefully_leave_swarm') : (JSON.parse(inputs
                    .response)).message;

                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Inspect Swarm Error Handler
    inspectSwarmErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such swarm";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Delete Node Error Handler
    deleteNodeErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "400":
                if (inputs.response.indexOf(
                        'rpc error: code = FailedPrecondition desc = node'
                    ) != -
                    1) {
                    outputs.error_message =
                        "Provided node is not down and can't be removed.";
                } else {
                    outputs.error_message = inputs.response ? (JSON
                            .parse(inputs.response)).message :
                        "400: Node is cluster manager and is a member of the raft cluster";
                }
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such node";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: Node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Look up Container Processes Error Handler
    lookupContainerProcessesErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such container";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Look up Container Stats Error Handler
    lookupContainerStatsErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: No such container";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Look up Tasks Error Handler
    lookupTasksErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            case "503":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "503: node is not part of a swarm";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Attach Network Error Handler
    attachNetworkErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "403":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "403: Operation not supported for swarm scoped networks";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: Network or container not found";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    // Disconnect Network Error Handler
    disconnectNetworkErrorHandler: function(inputs, outputs) {
        // Select right option for status_code. In case when additional message is not provided it will be substituted by string from API documentation.
        // If other error occurs, default message is provided.
        switch (String(inputs.status_code)) {
            case "403":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "403: Operation not supported for swarm scoped networks";
                break;
            case "404":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "404: Network or container not found";
                break;
            case "500":
                outputs.error_message = inputs.response ? (JSON.parse(
                        inputs.response)).message :
                    "500: Server Error";
                break;
            default:
                outputs.error_message = this.retrieveErrorMessage(
                    'unexpected_error');
        }
        return outputs;
    },

    type: 'DockerErrorHandler'
};
