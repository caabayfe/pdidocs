var DockerUtils = Class.create();
DockerUtils.prototype = {
    initialize: function() {},

    /*
    Params : json object 
    Functionality : Traverses through all key-value pairs part of the inputs and strips the value of any whitespace which are added inadverently around the values.
    Return : updated json object.	
    */

    trimStringInputs: function(inputs) {
        for (var key in inputs) {
            if (inputs[key] && typeof inputs[key] == 'string') {
                inputs[key] = inputs[key].trim();
            }
        }
        return inputs;
    },

    validateTag: function(tag) {
        if (tag) {
            return tag;
        } else {
            throw new Error("Tag cannot be empty.");
        }
    },
    validateRepo: function(repo) {
        if (repo) {
            return repo;
        } else {
            throw new Error("Repository cannot be empty.");
        }
    },
    invalidDetails: function() {
        throw new Error("Mandatory inputs for Private Repository are missing in Docker Credentials table.");

    },
    invalidImageName: function() {
        throw new Error("Image name does not match to the Repository name from Docker Credentials table.");

    },
    /*
    Params : json , input Name 
    Functionality : Parses JSON or throws exception
    Return : parsed json object.	
    */
    parseJson: function(json, inputName) {
        try {
            return JSON.parse(json);
        } catch (err) {
            throw new Error("JSON provided for " + inputName + " input is invalid.");
        }

    },

    parseAdditionalFields: function(fields, reqJson) {
        try {
            var FieldsArr = fields.trim().split(/\^/);
            for (var i = 0; i < FieldsArr.length; i++) {
                var nameValuePair = FieldsArr[i].split(/=/);
                //var keyValueJson = this.getValue(nameValuePair[0], nameValuePair[1]);
                //reqJson[keyValueJson.key] = keyValueJson.value;
                if (nameValuePair[1] == 'true')
                    reqJson[nameValuePair[0]] = true;
                else if (nameValuePair[1] == 'false')
                    reqJson[nameValuePair[0]] = false;
                else
                    reqJson[nameValuePair[0]] = nameValuePair[1];
            }
        } catch (e) {}
        return reqJson;
    },

    checkVolumeExists: function(name) {
        var checkVol = sn_fd.FlowAPI.executeAction('sn_docker_spoke.look_up_volumes');
        var checkName;
        for (var i in checkVol.volume.Volumes) {
            checkName = checkVol.volume.Volumes[i].Name;
            if (checkName === name)
                throw new Error("Provided Name already exists.");
        }

        return name;
    },

    checkBooleanValue: function(value) {
        if (value == "true")
            return true;
        else if (value == "false")
            return false;
        else
            return undefined;
    },

    createServicePayload: function(inputs) {
        var json_data = {};
        json_data.Name = inputs.name ? inputs.name : undefined;

        var labels = {};
        for (var i in inputs.Labels)
            if (inputs.Labels[i].key)
                labels[inputs.Labels[i].key] = inputs.Labels[i].value;
        json_data['Labels'] = labels;

        var TaskTemplate = {};
        TaskTemplate['ForceUpdate'] = inputs.TaskTemplate.ForceUpdate ? parseInt(inputs.TaskTemplate
            .ForceUpdate) : undefined;
        TaskTemplate['Runtime'] = inputs.TaskTemplate.Runtime ? inputs.TaskTemplate.Runtime : undefined;

        var PluginSpec = {};
        PluginSpec['Name'] = inputs.TaskTemplate.PluginSpec.Name ? inputs.TaskTemplate.PluginSpec.Name :
            undefined;
        PluginSpec['Remote'] = inputs.TaskTemplate.PluginSpec.Remote ? inputs.TaskTemplate.PluginSpec.Remote :
            undefined;
        PluginSpec['Disabled'] = Boolean(inputs.TaskTemplate.PluginSpec.Disabled);

        var PluginPrivilege = {};
        var PluginSpecFlag = false;
        for (var i in inputs.TaskTemplate.PluginSpec.PluginPrivilege) {
            if (inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Name) {
                PluginPrivilege[inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Name] = inputs.TaskTemplate
                    .PluginSpec.PluginPrivilege[i].Name ? inputs.TaskTemplate.PluginSpec.PluginPrivilege[i]
                    .Name : undefined;
                PluginPrivilege[inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Description] = inputs
                    .TaskTemplate.PluginSpec.PluginPrivilege[i].Description ? inputs.TaskTemplate.PluginSpec
                    .PluginPrivilege[i].Description : undefined;

                var Value = inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Value;
                if (Value.length >= 1 && Value[0] != "") {
                    PluginPrivilege['Value'] = [];
                    for (var j in Value)
                        PluginPrivilege.Value.push(Value[j]);
                }
                PluginSpecFlag = true;
            }
        }
        if (PluginSpecFlag === true)
            PluginSpec['PluginPrivilege'] = PluginPrivilege;

        if (inputs.TaskTemplate.PluginSpec.Name || inputs.TaskTemplate.PluginSpec.Remote || PluginSpecFlag ===
            true)
            TaskTemplate['PluginSpec'] = PluginSpec;

        var ContainerSpec = {};
        ContainerSpec['Image'] = inputs.TaskTemplate.ContainerSpec.Image ? inputs.TaskTemplate.ContainerSpec
            .Image : undefined;
        ContainerSpec['Hostname'] = inputs.TaskTemplate.ContainerSpec.Hostname ? inputs.TaskTemplate
            .ContainerSpec.Hostname : undefined;
        ContainerSpec['Dir'] = inputs.TaskTemplate.ContainerSpec.Dir ? inputs.TaskTemplate.ContainerSpec.Dir :
            undefined;
        ContainerSpec['User'] = inputs.TaskTemplate.ContainerSpec.User ? inputs.TaskTemplate.ContainerSpec
            .User : undefined;
        ContainerSpec['TTY'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.TTY);
        ContainerSpec['OpenStdin'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.OpenStdin);
        ContainerSpec['ReadOnly'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.ReadOnly);
        ContainerSpec['StopSignal'] = inputs.TaskTemplate.ContainerSpec.StopSignal ? inputs.TaskTemplate
            .ContainerSpec.StopSignal : undefined;
        ContainerSpec['StopGracePeriod'] = inputs.TaskTemplate.ContainerSpec.StopGracePeriod ? parseInt(inputs
            .TaskTemplate.ContainerSpec.StopGracePeriod) : undefined;
        ContainerSpec['Isolation'] = inputs.TaskTemplate.ContainerSpec.Isolation ? inputs.TaskTemplate
            .ContainerSpec.Isolation : undefined;
        ContainerSpec['Init'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.Init);

        var Command = inputs.TaskTemplate.ContainerSpec.Command;
        if (Command.length >= 1 && Command[0] != "") {
            ContainerSpec['Command'] = [];
            for (var i in Command)
                ContainerSpec.Command.push(Command[i]);
        }

        var Args = inputs.TaskTemplate.ContainerSpec.Args;
        if (Args.length >= 1 && Args[0] != "") {
            ContainerSpec['Args'] = [];
            for (var i in Args)
                ContainerSpec.Args.push(Args[i]);
        }

        var Env = inputs.TaskTemplate.ContainerSpec.Env;
        if (Env.length >= 1 && Env[0] != "") {
            ContainerSpec['Env'] = [];
            for (var i in Env)
                ContainerSpec.Env.push(Env[i]);
        }

        var Groups = inputs.TaskTemplate.ContainerSpec.Groups;
        if (Groups.length >= 1 && Groups[0] != "") {
            ContainerSpec['Groups'] = [];
            for (var i in Groups)
                ContainerSpec.Groups.push(Groups[i]);
        }

        var Hosts = inputs.TaskTemplate.ContainerSpec.Hosts;
        if (Hosts.length >= 1 && Hosts[0] != "") {
            ContainerSpec['Hosts'] = [];
            for (var i in Hosts)
                ContainerSpec.Hosts.push(Hosts[i]);
        }

        var CapabilityAdd = inputs.TaskTemplate.ContainerSpec.CapabilityAdd;
        if (CapabilityAdd.length >= 1 && CapabilityAdd[0] != "") {
            ContainerSpec['CapabilityAdd'] = [];
            for (var i in CapabilityAdd)
                ContainerSpec.CapabilityAdd.push(CapabilityAdd[i]);
        }

        var CapabilityDrop = inputs.TaskTemplate.ContainerSpec.CapabilityDrop;
        if (CapabilityDrop.length >= 1 && CapabilityDrop[0] != "") {
            ContainerSpec['CapabilityDrop'] = [];
            for (var i in CapabilityDrop)
                ContainerSpec.CapabilityDrop.push(CapabilityDrop[i]);
        }

        var labels = {};
        for (var i in inputs.TaskTemplate.ContainerSpec.Labels)
            if (inputs.TaskTemplate.ContainerSpec.Labels[i].key)
                labels[inputs.TaskTemplate.ContainerSpec.Labels[i].key] = inputs.TaskTemplate.ContainerSpec
                .Labels[i].value;
        ContainerSpec['Labels'] = labels;

        var Privileges = {};
        var privilege = inputs.TaskTemplate.ContainerSpec.Privileges;
        var CredentialSpec = {};
        var CredentialSpecFlag = false;
        CredentialSpec['Config'] = privilege.CredentialSpec.Config ? privilege.CredentialSpec.Config :
            undefined;
        CredentialSpec['File'] = privilege.CredentialSpec.File ? privilege.CredentialSpec.File : undefined;
        CredentialSpec['Registry'] = privilege.CredentialSpec.Registry ? privilege.CredentialSpec.Registry :
            undefined;
        if (privilege.CredentialSpec.Config || privilege.CredentialSpec.File || privilege.CredentialSpec
            .Registry) {
            Privileges['CredentialSpec'] = CredentialSpec;
            CredentialSpecFlag = true;
        }

        var SELinuxContext = {};
        var SELinuxContextFlag = false;
        SELinuxContext['Disable'] = Boolean(privilege.SELinuxContext.Disable);
        SELinuxContext['User'] = privilege.SELinuxContext.User ? privilege.SELinuxContext.User : undefined;
        SELinuxContext['Role'] = privilege.SELinuxContext.Role ? privilege.SELinuxContext.Role : undefined;
        SELinuxContext['Type'] = privilege.SELinuxContext.Type ? privilege.SELinuxContext.Type : undefined;
        SELinuxContext['Level'] = privilege.SELinuxContext.Level ? privilege.SELinuxContext.Level : undefined;
        if (privilege.SELinuxContext.User && privilege.SELinuxContext.Role && privilege.SELinuxContext.Type &&
            privilege.SELinuxContext.Level) {
            Privileges['SELinuxContext'] = SELinuxContext;
            SELinuxContextFlag = true;
        }

        if (CredentialSpecFlag === true || SELinuxContextFlag === true)
            ContainerSpec['Privileges'] = Privileges;

        ContainerSpec['Mounts'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Mounts) {
            var Mounts = {};
            var mount = inputs.TaskTemplate.ContainerSpec.Mounts[i];
            Mounts['Target'] = mount.Target ? mount.Target : undefined;
            Mounts['Source'] = mount.Source ? mount.Source : undefined;
            Mounts['Type'] = mount.Type ? mount.Type : undefined;
            Mounts['ReadOnly'] = new DockerUtils().checkBooleanValue(mount.ReadOnly);
            Mounts['Consistency'] = mount.Consistency ? mount.Consistency : undefined;

            var BindOptions = {};
            var BindFlag = false;
            if (mount.BindOptions.Propagation && mount.BindOptions.NonRecursive) {
                BindOptions['Propagation'] = mount.BindOptions.Propagation ? mount.BindOptions.Propagation :
                    undefined;
                BindOptions['NonRecursive'] = new DockerUtils().checkBooleanValue(mount.BindOptions.NonRecursive);
                BindFlag = true;
                Mounts['BindOptions'] = BindOptions;
            }

            var VolumeOptions = {};
            var VolumeFlag = false;
            var VolumeOptionsFlag = false;
            VolumeOptions['NoCopy'] = new DockerUtils().checkBooleanValue(mount.VolumeOptions.NoCopy);
            var VolumeOptionsLabels = {};
            for (var j in mount.VolumeOptions.Labels)
                if (mount.VolumeOptions.Labels[j].key) {
                    VolumeOptionsLabels[mount.VolumeOptions.Labels[j].key] = mount.VolumeOptions.Labels[j]
                        .value;
                    VolumeOptionsFlag = true;
                }
            if (VolumeOptionsFlag == true)
                VolumeOptions['Labels'] = VolumeOptionsLabels;

            var VolumeOptionsDriverConfig = {};
            VolumeOptionsDriverConfig['Name'] = mount.VolumeOptions.DriverConfig
                .Name ? mount.VolumeOptions.DriverConfig.Name : undefined;
            var OptionsFlag = false;
            for (var j in mount.VolumeOptions.DriverConfig.Options) {
                if (mount.VolumeOptions.DriverConfig.Options[j].key) {
                    var VolumeOptionsDriverConfigOptions = {};
                    VolumeOptionsDriverConfigOptions[mount.VolumeOptions
                            .DriverConfig.Options[j].key] = mount.VolumeOptions
                        .DriverConfig.Options[j].value;

                    VolumeOptionsDriverConfig['Options'] = VolumeOptionsDriverConfigOptions;
                    OptionsFlag = true;
                }
            }
            if (VolumeOptionsDriverConfig.Name && OptionsFlag == true)
                VolumeOptions['DriverConfig'] = VolumeOptionsDriverConfig;

            if (VolumeOptions.DriverConfig && VolumeOptions.Labels) {
                Mounts['VolumeOptions'] = VolumeOptions;
                VolumeFlag = true;
            }

            var TmpfsOptions = {};
            var TmpfsFlag = false;
            TmpfsOptions['SizeBytes'] = mount.TmpfsOptions.SizeBytes ? parseInt(mount.TmpfsOptions
                .SizeBytes) : undefined;
            TmpfsOptions['Mode'] = mount.TmpfsOptions.Mode ? parseInt(mount.TmpfsOptions.Mode) : undefined;
            if (mount.TmpfsOptions.SizeBytes && mount.TmpfsOptions.Mode) {
                Mounts['TmpfsOptions'] = TmpfsOptions;
                TmpfsFlag = true;
            }

            if (mount.Target || mount.Source || mount.Type || mount.ReadOnly || mount.Consistency ||
                BindFlag === true || VolumeFlag === true || TmpfsFlag === true)
                ContainerSpec.Mounts.push(Mounts);
        }

        var healthcheck = {};

        var Test = inputs.TaskTemplate.ContainerSpec.HealthCheck.Test;
        var testFlag = false;
        if (Test.length >= 1 && Test[0] != "") {
            healthcheck['Test'] = [];
            for (var i in Test) {
                healthcheck.Test.push(Test[i]);
                testFlag = true;
            }
        }

        var health = inputs.TaskTemplate.ContainerSpec.HealthCheck;
        healthcheck['Interval'] = health.Interval ? parseInt(health.Interval) : undefined;
        healthcheck['Timeout'] = health.Timeout ? parseInt(health.Timeout) : undefined;
        healthcheck['Retries'] = health.Retries ? parseInt(health.Retries) : undefined;
        healthcheck['StartPeriod'] = health.StartPeriod ? parseInt(health.StartPeriod) : undefined;
        if (health.Interval || health.Timeout || health.Retries || health.StartPeriod || testFlag === true)
            ContainerSpec['HealthCheck'] = healthcheck;

        var DNSConfig = {};
        var Nameservers = inputs.TaskTemplate.ContainerSpec.DNSConfig.Nameservers;
        var NameserversFlag = false;
        if (Nameservers.length >= 1 && Nameservers[0] != "") {
            DNSConfig['Nameservers'] = [];
            for (var i in Nameservers) {
                DNSConfig.Nameservers.push(Nameservers[i]);
                NameserversFlag = true;
            }
        }

        var Search = inputs.TaskTemplate.ContainerSpec.DNSConfig.Search;
        var SearchFlag = false;
        if (Search.length >= 1 && Search[0] != "") {
            DNSConfig['Search'] = [];
            for (var i in Search) {
                DNSConfig.Search.push(Search[i]);
                SearchFlag = true;
            }
        }

        var Options = inputs.TaskTemplate.ContainerSpec.DNSConfig.Options;
        var OptionsFlag = false;
        if (Options.length >= 1 && Options[0] != "") {
            DNSConfig['Options'] = [];
            for (var i in Options) {
                DNSConfig.Options.push(Options[i]);
                OptionsFlag = true;
            }
        }

        if (NameserversFlag === true || SearchFlag === true || OptionsFlag === true)
            ContainerSpec['DNSConfig'] = DNSConfig;

        ContainerSpec['Secrets'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Secrets) {
            var Secrets = {};
            var secret = inputs.TaskTemplate.ContainerSpec.Secrets[i];
            Secrets['SecretID'] = secret.SecretID ? secret.SecretID : undefined;
            Secrets['SecretName'] = secret.SecretName ? secret.SecretName : undefined;

            var File = {};
            File['Name'] = secret.File.Name ? secret.File.Name : undefined;
            File['UID'] = secret.File.UID ? secret.File.UID : undefined;
            File['GID'] = secret.File.GID ? secret.File.GID : undefined;
            File['Mode'] = secret.File.Mode ? parseInt(secret.File.Mode) : undefined;
            if (secret.File.Name || secret.File.UID || secret.File.GID || secret.File.Mode)
                Secrets['File'] = File;

            if (secret.SecretID || secret.SecretName)
                ContainerSpec.Secrets.push(Secrets);
        }

        ContainerSpec['Configs'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Configs) {
            var Configs = {};
            var config = inputs.TaskTemplate.ContainerSpec.Configs[i];
            Configs['ConfigID'] = config.ConfigID ? config.ConfigID : undefined;
            Configs['ConfigName'] = config.ConfigName ? config.ConfigName : undefined;
            Configs['Runtime'] = config.Runtime ? JSON.parse(config.Runtime) : undefined;

            var File = {};
            File['Name'] = config.File.Name ? config.File.Name : undefined;
            File['UID'] = config.File.UID ? config.File.UID : undefined;
            File['GID'] = config.File.GID ? config.File.GID : undefined;
            File['Mode'] = config.File.Mode ? parseInt(config.File.Mode) : undefined;
            if (config.File.Name || config.File.UID || config.File.GID || config.File.Mode)
                Configs['File'] = File;

            if (config.ConfigID || config.ConfigName)
                ContainerSpec.Configs.push(Configs);
        }

        var Sysctls = {};
        for (var i in inputs.TaskTemplate.ContainerSpec.Sysctls)
            if (inputs.TaskTemplate.ContainerSpec.Sysctls[i].key)
                labels[inputs.TaskTemplate.ContainerSpec.Sysctls[i].key] = inputs.TaskTemplate.ContainerSpec
                .Sysctls[i].value;
        ContainerSpec['Sysctls'] = Sysctls;

        ContainerSpec['Ulimits'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Ulimits) {
            var Ulimits = {};
            var ulimit = inputs.TaskTemplate.ContainerSpec.Ulimits[i];
            Ulimits['Name'] = ulimit.Name ? ulimit.Name : undefined;
            Ulimits['Soft'] = ulimit.Soft ? parseInt(ulimit.Soft) : undefined;
            Ulimits['Hard'] = ulimit.Hard ? parseInt(ulimit.Hard) : undefined;
            if (ulimit.Name && ulimit.Soft && ulimit.Hard)
                ContainerSpec.Ulimits.push(Ulimits);
        }

        if (inputs.TaskTemplate.ContainerSpec.Image)
            TaskTemplate['ContainerSpec'] = ContainerSpec;

        var NetworkAttachmentSpec = {};
        NetworkAttachmentSpec['Mode'] = inputs.TaskTemplate.NetworkAttachmentSpec.Mode ? parseInt(inputs
            .TaskTemplate.NetworkAttachmentSpec.Mode) : undefined;
        if (inputs.TaskTemplate.NetworkAttachmentSpec.Mode)
            TaskTemplate['NetworkAttachmentSpec'] = NetworkAttachmentSpec;

        var Resources = {};
        var Limits = {};
        var limit = inputs.TaskTemplate.Resources.Limits;
        Limits['NanoCPUs'] = limit.NanoCPUs ? parseInt(limit.NanoCPUs) : undefined;
        Limits['MemoryBytes'] = limit.MemoryBytes ? parseInt(limit.MemoryBytes) : undefined;
        Limits['Pids'] = limit.Pids ? parseInt(limit.Pids) : undefined;
        if (limit.NanoCPUs || limit.MemoryBytes || limit.Pids)
            Resources['Limits'] = Limits;

        var Reservation = {};
        var reserv = inputs.TaskTemplate.Resources.Reservation;
        Reservation['NanoCPUs'] = reserv.NanoCPUs ? parseInt(reserv.NanoCPUs) : undefined;
        Reservation['MemoryBytes'] = reserv.MemoryBytes ? parseInt(reserv.MemoryBytes) : undefined;

        Reservation['GenericResources'] = [];
        var GenericFlag = false;
        for (var i in inputs.TaskTemplate.Resources.Reservation.GenericResources) {
            var GenericResources = {};
            var genericR = inputs.TaskTemplate.Resources.Reservation.GenericResources[i];

            var NamedResourceSpec = {};
            var NamedResourceFlag = false;
            NamedResourceSpec['Kind'] = genericR.NamedResourceSpec.Kind ? genericR.NamedResourceSpec.Kind :
                undefined;
            NamedResourceSpec['Value'] = genericR.NamedResourceSpec.Value ? genericR.NamedResourceSpec.Value :
                undefined;
            if (genericR.NamedResourceSpec.Kind && genericR.NamedResourceSpec.Value) {
                GenericResources['NamedResourceSpec'] = NamedResourceSpec;
                NamedResourceFlag = true;
            }

            var DiscreteResourceSpec = {};
            var DiscreteResourceFlag = false;
            DiscreteResourceSpec['Kind'] = genericR.DiscreteResourceSpec.Kind ? genericR.DiscreteResourceSpec
                .Kind : undefined;
            DiscreteResourceSpec['Value'] = genericR.DiscreteResourceSpec.Value ? parseInt(genericR
                .DiscreteResourceSpec.Value) : undefined;
            if (genericR.DiscreteResourceSpec.Kind && genericR.DiscreteResourceSpec.Value) {
                GenericResources['DiscreteResourceSpec'] = DiscreteResourceSpec;
                DiscreteResourceFlag = true;
            }

            if (NamedResourceFlag === true && DiscreteResourceFlag === true)
                Reservation.GenericResources.push(GenericResources);

            GenericFlag = true;
        }

        if (limit.NanoCPUs || limit.MemoryBytes || GenericFlag === true)
            Resources['Reservation'] = Reservation;

        if (Resources.Limits || Resources.Reservation)
            TaskTemplate['Resources'] = Resources;

        var RestartPolicy = {};
        var restartP = inputs.TaskTemplate.RestartPolicy;
        RestartPolicy['Condition'] = restartP.Condition ? restartP.Condition : undefined;
        RestartPolicy['Delay'] = restartP.Delay ? parseInt(restartP.Delay) : undefined;
        RestartPolicy['MaxAttempts'] = restartP.MaxAttempts ? parseInt(restartP.MaxAttempts) : undefined;
        RestartPolicy['Window'] = restartP.Window ? parseInt(restartP.Window) : undefined;
        if (restartP.Condition || restartP.Delay || restartP.MaxAttempts || restartP.Window)
            TaskTemplate['RestartPolicy'] = RestartPolicy;

        var Placement = {};
        var placeM = inputs.TaskTemplate.Placement;
        Placement['MaxReplicas'] = placeM.MaxReplicas ? parseInt(placeM.MaxReplicas) : undefined;

        var Constraints = placeM.Constraints;
        var constraintsFlag = false;
        if (Constraints.length >= 1 && Constraints[0] != "") {
            Placement['Constraints'] = [];
            for (var i in Constraints) {
                Placement.Constraints.push(Constraints[i]);
                constraintsFlag = true;
            }
        }

        Placement['Preferences'] = [];
        var PreferencesFlag = false;
        for (var i in placeM.Preferences) {
            var Preferences = {};
            var prefer = placeM.Preferences[i];
            var Spread = {};
            Spread['SpreadDescriptor'] = prefer.Spread.SpreadDescriptor ? prefer.Spread.SpreadDescriptor :
                undefined;
            if (prefer.Spread.SpreadDescriptor)
                Preferences['Spread'] = Spread;

            if (prefer.Spread) {
                Placement.Preferences.push(Preferences);
                PreferencesFlag = true;
            }
        }

        Placement['Platforms'] = [];
        var PlatformsFlag = false;
        for (var i in placeM.Platforms) {
            var Platforms = {};
            var platF = placeM.Platforms[i];
            Platforms['Architecture'] = platF.Architecture ? platF.Architecture : undefined;
            Platforms['OS'] = platF.OS ? platF.OS : undefined;

            if (platF.Architecture || platF.OS) {
                Placement.Platforms.push(Platforms);
                PlatformsFlag = true;
            }
        }

        if (placeM.MaxReplicas || constraintsFlag === true || PreferencesFlag === true || PlatformsFlag ===
            true)
            TaskTemplate['Placement'] = Placement;

        TaskTemplate['Networks'] = [];
        var NetworksFlag = false;
        for (var i in inputs.TaskTemplate.Networks) {
            var Networks = {};
            var network = inputs.TaskTemplate.Networks[i];
            Networks['Target'] = network.Target ? network.Target : undefined;

            var Aliases = network.Aliases;
            var AliasesFlag = false;
            if (Aliases.length >= 1 && Aliases[0] != "") {
                Networks['Aliases'] = [];
                for (var i in Aliases) {
                    Networks.Aliases.push(Aliases[i]);
                    AliasesFlag = true;
                }
            }

            var DriverOpts = {};
            var DriverOptsFlag = false;
            for (var j in network.DriverOpts)
                if (network.DriverOpts[j].key) {
                    DriverOpts[network.DriverOpts[j].key] = network.DriverOpts[j].value;
                    DriverOptsFlag = true;
                }
            if (DriverOptsFlag === true)
                Networks['DriverOpts'] = DriverOpts;

            if (network.Target || AliasesFlag === true || DriverOptsFlag === true) {
                TaskTemplate.Networks.push(Networks);
                NetworksFlag = true;
            }
        }

        var LogDriver = {};
        LogDriver['Name'] = inputs.TaskTemplate.LogDriver.Name ? inputs.TaskTemplate.LogDriver.Name :
            undefined;

        var Options = {};
        var OptionsFlag = false;
        for (var i in inputs.TaskTemplate.LogDriver.Options)
            if (inputs.TaskTemplate.LogDriver.Options[i].key) {
                Options[inputs.TaskTemplate.LogDriver.Options[i].key] = inputs.TaskTemplate.LogDriver.Options[
                    i].value;
                OptionsFlag = true;
            }
        if (OptionsFlag === true)
            LogDriver['Options'] = Options;

        if (inputs.TaskTemplate.LogDriver.Name || OptionsFlag === true)
            TaskTemplate['LogDriver'] = LogDriver;

        if (inputs.TaskTemplate.ContainerSpec.Image)
            json_data['TaskTemplate'] = TaskTemplate;

        var Mode = {};
        var Replicated = {};
        if ((inputs.mode) && (inputs.mode.Replicated) && (inputs.mode.Replicated.Replicas))
            Replicated['Replicas'] = inputs.mode.Replicated.Replicas;
        else
            Replicated['Replicas'] = 0;
        Mode['Replicated'] = Replicated;
        json_data['Mode'] = Mode;

        var UpdateConfig = {};
        UpdateConfig['Parallelism'] = inputs.UpdateConfig.Parallelism ? parseInt(inputs.UpdateConfig
            .Parallelism) : undefined;
        UpdateConfig['Delay'] = inputs.UpdateConfig.Delay ? parseInt(inputs.UpdateConfig.Delay) : undefined;
        UpdateConfig['FailureAction'] = inputs.UpdateConfig.FailureAction ? inputs.UpdateConfig
            .FailureAction : undefined;
        UpdateConfig['Monitor'] = inputs.UpdateConfig.Monitor ? parseInt(inputs.UpdateConfig.Monitor) :
            undefined;
        UpdateConfig['MaxFailureRatio'] = inputs.UpdateConfig.MaxFailureRatio ? parseInt(inputs.UpdateConfig
            .MaxFailureRatio) : undefined;
        if (inputs.UpdateConfig.Parallelism || inputs.UpdateConfig.Delay || inputs.UpdateConfig
            .FailureAction || inputs.UpdateConfig.Monitor || inputs.UpdateConfig.MaxFailureRatio)
            json_data['UpdateConfig'] = UpdateConfig;

        var RollbackConfig = {};
        RollbackConfig['Parallelism'] = inputs.RollbackConfig.Parallelism ? parseInt(inputs.RollbackConfig
            .Parallelism) : undefined;
        RollbackConfig['Delay'] = inputs.RollbackConfig.Delay ? parseInt(inputs.RollbackConfig.Delay) :
            undefined;
        RollbackConfig['FailureAction'] = inputs.RollbackConfig.FailureAction ? inputs.RollbackConfig
            .FailureAction : undefined;
        RollbackConfig['Monitor'] = inputs.RollbackConfig.Monitor ? parseInt(inputs.RollbackConfig.Monitor) :
            undefined;
        RollbackConfig['MaxFailureRatio'] = inputs.RollbackConfig.MaxFailureRatio ? parseInt(inputs
            .RollbackConfig.MaxFailureRatio) : undefined;
        if (inputs.RollbackConfig.Parallelism || inputs.RollbackConfig.Delay || inputs.RollbackConfig
            .FailureAction || inputs.RollbackConfig.Monitor || inputs.RollbackConfig.MaxFailureRatio)
            json_data['RollbackConfig'] = RollbackConfig;

        json_data['Networks'] = [];
        for (var i in inputs.networks) {
            var Networks = {};
            var network = inputs.networks[i];
            Networks['Target'] = network.Target ? network.Target : undefined;

            if (network.Target)
                json_data.Networks.push(Networks);
        }

        var EndpointSpec = {};
        EndpointSpec['Mode'] = inputs.EndpointSpec.Mode ? inputs.EndpointSpec.Mode : undefined;

        EndpointSpec['Ports'] = [];
        var PortFlag = false;
        for (var i in inputs.EndpointSpec.Ports) {
            var Ports = {};
            var port = inputs.EndpointSpec.Ports[i];
            Ports['Name'] = port.Name ? port.Name : undefined;
            Ports['Protocol'] = port.Protocol ? port.Protocol : undefined;
            Ports['TargetPort'] = port.TargetPort ? parseInt(port.TargetPort) : undefined;
            Ports['PublishedPort'] = port.PublishedPort ? parseInt(port.PublishedPort) : undefined;
            Ports['PublishMode'] = port.PublishMode ? port.PublishMode : undefined;

            if (port.Target || port.Protocol || port.TargetPort || port.PublishedPort || port.PublishMode) {
                EndpointSpec.Ports.push(Ports);
                PortFlag = true;
            }
        }

        if (inputs.EndpointSpec.Mode || PortFlag === true)
            json_data['EndpointSpec'] = EndpointSpec;

        return json_data;
    },

    createContainerPayload: function(inputs) {
        var json_data = {};
        try {
            json_data['Image'] = inputs.Image ? inputs.Image : undefined;

            var exposedports = {};
            for (var i in inputs.ExposedPorts)
                if (inputs.ExposedPorts[i].key)
                    exposedports[inputs.ExposedPorts[i].key] = JSON.parse(inputs.ExposedPorts[i].value);
            json_data['ExposedPorts'] = exposedports;

            var env = inputs.Env;
            if (env.length >= 1 && env[0] != "") {
                json_data['Env'] = [];
                for (var i in env)
                    json_data.Env.push(env[i]);
            }

            var cmd = inputs.Cmd;
            if (cmd.length >= 1 && cmd[0] != "") {
                json_data['Cmd'] = [];
                for (var i in cmd)
                    json_data.Cmd.push(cmd[i]);
            }

            var entrypoint = inputs.Entrypoint;
            if (entrypoint.length >= 1 && entrypoint[0] != "") {
                json_data['Entrypoint'] = [];
                for (var i in entrypoint)
                    json_data.Entrypoint.push(entrypoint[i]);
            }

            var onbuild = inputs.OnBuild;
            if (onbuild.length >= 1 && onbuild[0] != "") {
                json_data['OnBuild'] = [];
                for (var i in onbuild)
                    json_data.OnBuild.push(onbuild[i]);
            }

            var shell = inputs.Shell;
            if (shell.length >= 1 && shell[0] != "") {
                json_data['Shell'] = [];
                for (var i in shell)
                    json_data.Shell.push(shell[i]);
            }

            var healthcheck = {};
            var test = inputs.Healthcheck.Test;
            if (test.length >= 1 && test[0] != "") {
                healthcheck['Test'] = [];
                for (var i in test)
                    healthcheck.Test.push(test[i]);
            }

            healthcheck['Interval'] = inputs.Healthcheck.Interval ? parseInt(inputs.Healthcheck.Interval) :
                undefined;
            healthcheck['Timeout'] = inputs.Healthcheck.Timeout ? parseInt(inputs.Healthcheck.Timeout) :
                undefined;
            healthcheck['Retries'] = inputs.Healthcheck.Retries ? parseInt(inputs.Healthcheck.Retries) :
                undefined;
            healthcheck['StartPeriod'] = inputs.Healthcheck.StartPeriod ? parseInt(inputs.Healthcheck
                .StartPeriod) : undefined;
            json_data['Healthcheck'] = healthcheck;

            var volumes = {};
            for (var i in inputs.Volumes)
                if (inputs.Volumes[i].key)
                    volumes[inputs.Volumes[i].key] = JSON.parse(inputs.Volumes[i].value);
            json_data['Volumes'] = volumes;

            var labels = {};
            for (var i in inputs.Labels)
                if (inputs.Labels[i].key)
                    labels[inputs.Labels[i].key] = inputs.Labels[i].value;
            json_data['Labels'] = labels;

            var hostconfig = {};
            for (var key in inputs.HostConfig) {
                if (inputs.HostConfig[key]) {
                    if (key === "CgroupParent" || key === "Healthcheck" || key === "CpusetCpus" || key ===
                        "CpusetMems" || key === "ContainerIDFile" || key === "NetworkMode" || key ===
                        "VolumeDriver" || key === "CgroupnsMode" || key === "IpcMode" || key === "Cgroup" ||
                        key === "PidMode" || key === "UTSMode" || key === "UsernsMode" || key === "Runtime" ||
                        key === "Isolation")
                        hostconfig[key] = inputs.HostConfig[key] ? inputs.HostConfig[key] : undefined;

                    if (key === "CpuShares" || key === "Memory" || key === "BlkioWeight" || key ===
                        "CpuPeriod" || key === "CpuQuota" || key === "CpuRealtimePeriod" || key ===
                        "CpuRealtimeRuntime" || key === "KernelMemory" || key === "KernelMemoryTCP" || key ===
                        "MemoryReservation" || key === "MemorySwap" || key === "MemorySwappiness" || key ===
                        "NanoCpus" || key === "PidsLimit" || key === "CpuCount" || key === "CpuPercent" ||
                        key === "IOMaximumIOps" || key === "IOMaximumBandwidth" || key === "OomScoreAdj" ||
                        key === "ShmSize")
                        hostconfig[key] = inputs.HostConfig[key] ? parseInt(inputs.HostConfig[key]) :
                        undefined;
                }
            }

            hostconfig['ReadonlyRootfs'] = new DockerUtils().checkBooleanValue(inputs.HostConfig
                .ReadonlyRootfs);
            hostconfig['OomKillDisable'] = new DockerUtils().checkBooleanValue(inputs.HostConfig
                .OomKillDisable);
            hostconfig['Init'] = new DockerUtils().checkBooleanValue(inputs.HostConfig.Init);
            hostconfig['AutoRemove'] = new DockerUtils().checkBooleanValue(inputs.HostConfig.AutoRemove);
            hostconfig['Privileged'] = new DockerUtils().checkBooleanValue(inputs.HostConfig.Privileged);
            hostconfig['PublishAllPorts'] = new DockerUtils().checkBooleanValue(inputs.HostConfig
                .PublishAllPorts);

            hostconfig['BlkioWeightDevice'] = [];
            for (var i in inputs.HostConfig.BlkioWeightDevice) {
                var BlkioWeightDevice = {};
                BlkioWeightDevice['Path'] = inputs.HostConfig.BlkioWeightDevice[i].Path ? inputs.HostConfig
                    .BlkioWeightDevice[i].Path : undefined;
                BlkioWeightDevice['Weight'] = inputs.HostConfig.BlkioWeightDevice[i].Weight ? parseInt(inputs
                    .HostConfig.BlkioWeightDevice[i].Weight) : undefined;
                if (BlkioWeightDevice['Path'] && BlkioWeightDevice['Weight'])
                    hostconfig.BlkioWeightDevice.push(BlkioWeightDevice);
            }

            hostconfig['BlkioDeviceReadBps'] = [];
            for (var i in inputs.HostConfig.BlkioDeviceReadBps) {
                var BlkioDeviceReadBps = {};
                BlkioDeviceReadBps['Path'] = inputs.HostConfig.BlkioDeviceReadBps[i].Path ? inputs.HostConfig
                    .BlkioDeviceReadBps[i].Path : undefined;
                BlkioDeviceReadBps['Rate'] = inputs.HostConfig.BlkioDeviceReadBps[i].Weight ? parseInt(inputs
                    .HostConfig.BlkioDeviceReadBps[i].Weight) : undefined;
                if (BlkioDeviceReadBps['Path'] && BlkioDeviceReadBps['Rate'])
                    hostconfig.BlkioDeviceReadBps.push(BlkioDeviceReadBps);
            }

            hostconfig['BlkioDeviceWriteBps'] = [];
            for (var i in inputs.HostConfig.BlkioDeviceWriteBps) {
                var BlkioDeviceWriteBps = {};
                BlkioDeviceWriteBps['Path'] = inputs.HostConfig.BlkioDeviceWriteBps[i].Path ? inputs
                    .HostConfig.BlkioDeviceWriteBps[i].Path : undefined;
                BlkioDeviceWriteBps['Rate'] = inputs.HostConfig.BlkioDeviceWriteBps[i].Rate ? parseInt(inputs
                    .HostConfig.BlkioDeviceWriteBps[i].Rate) : undefined;
                if (BlkioDeviceWriteBps['Path'] && BlkioDeviceWriteBps['Rate'])
                    hostconfig.BlkioDeviceWriteBps.push(BlkioDeviceWriteBps);
            }

            hostconfig['BlkioDeviceReadIOps'] = [];
            for (var i in inputs.HostConfig.BlkioDeviceReadIOps) {
                var BlkioDeviceReadIOps = {};
                BlkioDeviceReadIOps['Path'] = inputs.HostConfig.BlkioDeviceReadIOps[i].Path ? inputs
                    .HostConfig.BlkioDeviceReadIOps[i].Path : undefined;
                BlkioDeviceReadIOps['Rate'] = inputs.HostConfig.BlkioDeviceReadIOps[i].Rate ? parseInt(inputs
                    .HostConfig.BlkioDeviceReadIOps[i].Rate) : undefined;
                if (BlkioDeviceReadIOps['Path'] && BlkioDeviceReadIOps['Rate'])
                    hostconfig.BlkioDeviceReadIOps.push(BlkioDeviceReadIOps);
            }

            hostconfig['BlkioDeviceWriteIOps'] = [];
            for (var i in inputs.HostConfig.BlkioDeviceWriteIOps) {
                var BlkioDeviceWriteIOps = {};
                BlkioDeviceWriteIOps['Path'] = inputs.HostConfig.BlkioDeviceWriteIOps[i].Path ? inputs
                    .HostConfig.BlkioDeviceWriteIOps[i].Path : undefined;
                BlkioDeviceWriteIOps['Rate'] = inputs.HostConfig.BlkioDeviceWriteIOps[i].Rate ? parseInt(
                    inputs.HostConfig.BlkioDeviceWriteIOps[i].Rate) : undefined;
                if (BlkioDeviceWriteIOps['Path'] && BlkioDeviceWriteIOps['Rate'])
                    hostconfig.BlkioDeviceWriteIOps.push(BlkioDeviceWriteIOps);
            }

            hostconfig['Devices'] = [];
            for (var i in inputs.HostConfig.Devices)
                if (inputs.HostConfig.Devices[i].PathOnHost || inputs.HostConfig.Devices[i].PathInContainer ||
                    inputs.HostConfig.Devices[i].CgroupPermissions)
                    hostconfig.Devices.push(inputs.HostConfig.Devices[i]);

            var DeviceCgroupRules = inputs.HostConfig.DeviceCgroupRules;
            if (DeviceCgroupRules.length <= 1 && DeviceCgroupRules[0] != "") {
                hostconfig['DeviceCgroupRules'] = [];
                for (var i in DeviceCgroupRules)
                    hostconfig.DeviceCgroupRules.push(DeviceCgroupRules[i]);
            }

            hostconfig['DeviceRequests'] = [];
            for (var i in inputs.HostConfig.DeviceRequests) {
                var DeviceRequests = {};
                DeviceRequests['Driver'] = inputs.HostConfig.DeviceRequests[i].Driver ? inputs.HostConfig
                    .DeviceRequests[i].Driver : undefined;
                DeviceRequests['Count'] = inputs.HostConfig.DeviceRequests[i].Count ? parseInt(inputs
                    .HostConfig.DeviceRequests[i].Count) : undefined;

                var DeviceIDs = inputs.HostConfig.DeviceRequests[i].DeviceIDs;
                var DeviceIDsFlag = false;
                if (DeviceIDs.length >= 1 && DeviceIDs[0] != "") {
                    DeviceRequests['DeviceIDs'] = [];
                    for (var j in DeviceIDs) {
                        DeviceRequests.DeviceIDs.push(DeviceIDs[j]);
                        DeviceIDsFlag = true;
                    }
                }

                var Capabilities = inputs.HostConfig.DeviceRequests[i].Capabilities;
                var CapabilitiesFlag = false;
                if (Capabilities.length >= 1 && Capabilities[0] != "") {
                    DeviceRequests['Capabilities'] = [];
                    for (var j in Capabilities) {
                        DeviceRequests.Capabilities.push(Capabilities[j]);
                        CapabilitiesFlag = true;
                    }
                }

                var OptiosFlag = false;
                for (var j in inputs.HostConfig.DeviceRequests[i].Options)
                    if (inputs.HostConfig.DeviceRequests[i].Options[j].key) {
                        DeviceRequests['Options'] = {};
                        DeviceRequests.Options[inputs.HostConfig.DeviceRequests[i].Options[j].key] = inputs
                            .HostConfig.DeviceRequests[i].Options[j].value;
                        OptiosFlag = true;
                    }

                if (DeviceRequests['Driver'] || DeviceRequests['Count'] || DeviceIDsFlag == true ||
                    CapabilitiesFlag == true || OptiosFlag == true)
                    hostconfig.DeviceRequests.push(DeviceRequests);
            }

            hostconfig['Ulimits'] = [];
            for (var i in inputs.HostConfig.Ulimits) {
                var Ulimits = {};
                Ulimits['Name'] = inputs.HostConfig.Ulimits[i].Name ? inputs.HostConfig.Ulimits[i].Name :
                    undefined;
                Ulimits['Soft'] = inputs.HostConfig.Ulimits[i].Soft ? parseInt(inputs.HostConfig.Ulimits[i]
                    .Soft) : undefined;
                Ulimits['Hard'] = inputs.HostConfig.Ulimits[i].Hard ? parseInt(inputs.HostConfig.Ulimits[i]
                    .Hard) : undefined;
                if (Ulimits['Name'] || Ulimits['Soft'] || Ulimits['Hard'])
                    hostconfig.Ulimits.push(Ulimits);
            }

            var LogConfig = {};
            LogConfig['Type'] = inputs.HostConfig.LogConfig.Type ? inputs.HostConfig.LogConfig.Type :
                undefined;
            LogConfig['Config'] = {};
            for (var i in inputs.HostConfig.LogConfig.Config)
                if (inputs.HostConfig.LogConfig.Config[i].key)
                    LogConfig['Config'][inputs.HostConfig.LogConfig.Config[i].key] = inputs.HostConfig
                    .LogConfig.Config[i].value;
            hostconfig['LogConfig'] = LogConfig;

            var PortBindings = {};
            for (var i in inputs.HostConfig.PortBindings) {
                if (inputs.HostConfig.PortBindings[i].key) {
                    PortBindings[inputs.HostConfig.PortBindings[i].key] = [];
                    var port_value = inputs.HostConfig.PortBindings[i].value;
                    for (var j in port_value)
                        PortBindings[inputs.HostConfig.PortBindings[i].key].push(port_value[j]);
                }
            }
            hostconfig['PortBindings'] = PortBindings;

            if (inputs.HostConfig.RestartPolicy.Name) {
                var RestartPolicy = {};
                RestartPolicy['Name'] = inputs.HostConfig.RestartPolicy.Name ? inputs.HostConfig.RestartPolicy
                    .Name : undefined;
                if (inputs.HostConfig.RestartPolicy.Name == "on-failure")
                    RestartPolicy['MaximumRetryCount'] = inputs.HostConfig.RestartPolicy.MaximumRetryCount ?
                    parseInt(inputs.HostConfig.RestartPolicy.MaximumRetryCount) : undefined;
                hostconfig['RestartPolicy'] = RestartPolicy;
            }

            var Binds = inputs.HostConfig.Binds;
            if (Binds.length >= 1 && Binds[0] != "") {
                hostconfig['Binds'] = [];
                for (var i in Binds)
                    hostconfig.Binds.push(Binds[i]);
            }

            var VolumesFrom = inputs.HostConfig.VolumesFrom;
            if (VolumesFrom.length >= 1 && VolumesFrom[0] != "") {
                hostconfig['VolumesFrom'] = [];
                for (var i in VolumesFrom)
                    hostconfig.VolumesFrom.push(VolumesFrom[i]);
            }

            hostconfig['Mounts'] = [];
            for (var i in inputs.HostConfig.Mounts) {
                var Mounts = {};
                var mount = inputs.HostConfig.Mounts[i];
                Mounts['Target'] = mount.Target ? mount.Target : undefined;
                Mounts['Source'] = mount.Source ? mount.Source : undefined;
                Mounts['Type'] = mount.Type ? mount.Type : undefined;
                Mounts['ReadOnly'] = new DockerUtils().checkBooleanValue(mount.ReadOnly);
                Mounts['Consistency'] = mount.Consistency ? inputs.HostConfig.Mounts[i].Consistency :
                    undefined;

                var BindOptions = {};
                var BindFlag = false;
                if (mount.BindOptions.Propagation && mount.BindOptions.NonRecursive) {
                    BindOptions['Propagation'] = mount.BindOptions.Propagation ? inputs
                        .HostConfig.Mounts[i].BindOptions.Propagation : undefined;
                    BindOptions['NonRecursive'] = new DockerUtils().checkBooleanValue(mount.BindOptions
                        .NonRecursive);
                    BindFlag = true;
                    Mounts['BindOptions'] = BindOptions;
                }

                var VolumeOptions = {};
                var VolumeFlag = false;
                var VolumeOptionsFlag = false;
                VolumeOptions['NoCopy'] = new DockerUtils().checkBooleanValue(mount.VolumeOptions.NoCopy);
                var VolumeOptionsLabels = {};
                for (var j in mount.VolumeOptions.Labels)
                    if (mount.VolumeOptions.Labels[j].key) {
                        VolumeOptionsLabels[mount.VolumeOptions.Labels[j].key] = inputs
                            .HostConfig.Mounts[i].VolumeOptions.Labels[j].value;
                        VolumeOptionsFlag = true;
                    }
                if (VolumeOptionsFlag == true)
                    VolumeOptions['Labels'] = VolumeOptionsLabels;

                var VolumeOptionsDriverConfig = {};
                VolumeOptionsDriverConfig['Name'] = mount.VolumeOptions.DriverConfig
                    .Name ? mount.VolumeOptions.DriverConfig.Name : undefined;
                var OptionsFlag = false;
                for (var j in mount.VolumeOptions.DriverConfig.Options) {
                    if (mount.VolumeOptions.DriverConfig.Options[j].key) {
                        var VolumeOptionsDriverConfigOptions = {};
                        VolumeOptionsDriverConfigOptions[mount.VolumeOptions
                                .DriverConfig.Options[j].key] = mount.VolumeOptions
                            .DriverConfig.Options[j].value;

                        VolumeOptionsDriverConfig['Options'] = VolumeOptionsDriverConfigOptions;
                        OptionsFlag = true;
                    }
                }
                if (VolumeOptionsDriverConfig.Name && OptionsFlag == true)
                    VolumeOptions['DriverConfig'] = VolumeOptionsDriverConfig;

                if (VolumeOptions.DriverConfig && VolumeOptions.Labels) {
                    Mounts['VolumeOptions'] = VolumeOptions;
                    VolumeFlag = true;
                }

                var TmpfsOptions = {};
                var TmpfsFlag = false;
                TmpfsOptions['SizeBytes'] = mount.TmpfsOptions.SizeBytes ? parseInt(
                    mount.TmpfsOptions.SizeBytes) : undefined;
                TmpfsOptions['Mode'] = mount.TmpfsOptions.Mode ? parseInt(inputs
                    .HostConfig.Mounts[i].TmpfsOptions.Mode) : undefined;
                if (mount.TmpfsOptions.SizeBytes && mount.TmpfsOptions.Mode) {
                    Mounts['TmpfsOptions'] = TmpfsOptions;
                    TmpfsFlag = true;
                }

                if (mount.Target || mount.Source || mount.Type || mount.ReadOnly || mount.Consistency ||
                    BindFlag === true || VolumeFlag === true || TmpfsFlag === true)
                    hostconfig.Mounts.push(Mounts);
            }

            var CapAdd = inputs.HostConfig.CapAdd;
            if (CapAdd.length >= 1 && CapAdd[0] != "") {
                hostconfig['CapAdd'] = [];
                for (var i in CapAdd)
                    hostconfig.CapAdd.push(CapAdd[i]);
            }

            var CapDrop = inputs.HostConfig.CapDrop;
            if (CapDrop.length >= 1 && CapDrop[0] != "") {
                hostconfig['CapDrop'] = [];
                for (var i in CapDrop)
                    hostconfig.CapDrop.push(CapDrop[i]);
            }

            var Dns = inputs.HostConfig.Dns;
            if (Dns.length >= 1 && Dns[0] != "") {
                hostconfig['Dns'] = [];
                for (var i in Dns)
                    hostconfig.Dns.push(Dns[i]);
            }

            var DnsOptions = inputs.HostConfig.DnsOptions;
            if (DnsOptions.length >= 1 && DnsOptions[0] != "") {
                hostconfig['DnsOptions'] = [];
                for (var i in DnsOptions)
                    hostconfig.DnsOptions.push(DnsOptions[i]);
            }

            var DnsSearch = inputs.HostConfig.DnsSearch;
            if (DnsSearch.length >= 1 && DnsSearch[0] != "") {
                hostconfig['DnsSearch'] = [];
                for (var i in DnsSearch)
                    hostconfig.DnsSearch.push(DnsSearch[i]);
            }

            var ExtraHosts = inputs.HostConfig.ExtraHosts;
            if (ExtraHosts.length >= 1 && ExtraHosts[0] != "") {
                hostconfig['ExtraHosts'] = [];
                for (var i in ExtraHosts)
                    hostconfig.ExtraHosts.push(ExtraHosts[i]);
            }

            var GroupAdd = inputs.HostConfig.GroupAdd;
            if (GroupAdd.length >= 1 && GroupAdd[0] != "") {
                hostconfig['GroupAdd'] = [];
                for (var i in GroupAdd)
                    hostconfig.GroupAdd.push(GroupAdd[i]);
            }

            var Links = inputs.HostConfig.Links;
            if (Links.length >= 1 && Links[0] != "") {
                hostconfig['Links'] = [];
                for (var i in Links)
                    hostconfig.Links.push(Links[i]);
            }

            var SecurityOpt = inputs.HostConfig.SecurityOpt;
            if (SecurityOpt.length >= 1 && SecurityOpt[0] != "") {
                hostconfig['SecurityOpt'] = [];
                for (var i in SecurityOpt)
                    hostconfig.SecurityOpt.push(SecurityOpt[i]);
            }

            var MaskedPaths = inputs.HostConfig.MaskedPaths;
            if (MaskedPaths.length >= 1 && MaskedPaths[0] != "") {
                hostconfig['MaskedPaths'] = [];
                for (var i in MaskedPaths)
                    hostconfig.MaskedPaths.push(MaskedPaths[i]);
            }

            var ReadonlyPaths = inputs.HostConfig.ReadonlyPaths;
            if (ReadonlyPaths.length >= 1 && ReadonlyPaths[0] != "") {
                hostconfig['ReadonlyPaths'] = [];
                for (var i in ReadonlyPaths)
                    hostconfig.ReadonlyPaths.push(ReadonlyPaths[i]);
            }

            var ConsoleSize = inputs.HostConfig.ConsoleSize;
            hostconfig['ConsoleSize'] = [];
            for (var i in ConsoleSize)
                hostconfig.ConsoleSize.push(parseInt(ConsoleSize[i]));

            var StorageOpt = {};
            for (var i in inputs.HostConfig.StorageOpt)
                if (inputs.HostConfig.StorageOpt[i].key)
                    StorageOpt[inputs.HostConfig.StorageOpt[i].key] = inputs.HostConfig.StorageOpt[i].value;
            hostconfig['StorageOpt'] = StorageOpt;

            var Tmpfs = {};
            for (var i in inputs.HostConfig.Tmpfs)
                if (inputs.HostConfig.Tmpfs[i].key)
                    Tmpfs[inputs.HostConfig.Tmpfs[i].key] = inputs.HostConfig.Tmpfs[i].value;
            hostconfig['Tmpfs'] = Tmpfs;

            var Sysctls = {};
            for (var i in inputs.HostConfig.Sysctls)
                if (inputs.HostConfig.Sysctls[i].key)
                    Sysctls[inputs.HostConfig.Sysctls[i].key] = inputs.HostConfig.Sysctls[i].value;
            hostconfig['Sysctls'] = Sysctls;

            json_data['HostConfig'] = hostconfig;

            var networkingconfig = {};
            var EndpointsConfig = {};
            var flag = false;

            for (var i in inputs.NetworkingConfig.EndpointsConfig) {
                if (inputs.NetworkingConfig.EndpointsConfig[i].key) {
                    var port_value = inputs.NetworkingConfig.EndpointsConfig[i].value;
                    var Value = {};
                    for (var j in port_value) {
                        Value['NetworkID'] = port_value[j].NetworkID ? port_value[j].NetworkID :
                            undefined;
                        Value['EndpointID'] = port_value[j].EndpointID ? port_value[j].EndpointID :
                            undefined;
                        Value['Gateway'] = port_value[j].Gateway ? port_value[j].Gateway : undefined;
                        Value['IPAddress'] = port_value[j].IPAddress ? port_value[j].IPAddress :
                            undefined;
                        Value['IPv6Gateway'] = port_value[j].IPv6Gateway ? port_value[j].IPv6Gateway :
                            undefined;
                        Value['GlobalIPv6Address'] = port_value[j].GlobalIPv6Address ? port_value[j]
                            .GlobalIPv6Address : undefined;
                        Value['MacAddress'] = port_value[j].MacAddress ? port_value[j].MacAddress :
                            undefined;
                        Value['IPPrefixLen'] = port_value[j].IPPrefixLen ? parseInt(port_value[j]
                            .IPPrefixLen) : undefined;
                        Value['GlobalIPv6PrefixLen'] = port_value[j].GlobalIPv6PrefixLen ? parseInt(
                            port_value[j].GlobalIPv6PrefixLen) : undefined;

                        if (port_value[j].Links.length >= 1 && port_value[j].Links[0] != "") {
                            Value['Links'] = [];
                            for (var k in port_value[j].Links)
                                Value.port_value[j].Links.push(port_value[j].Links[k]);
                        }

                        if (port_value[j].Aliases.length >= 1 && port_value[j].Aliases[0] != "") {
                            Value['Aliases'] = [];
                            for (var k in port_value[j].Aliases)
                                Value.port_value[j].Aliases.push(port_value[j].Aliases[k]);
                        }

                        var IPAMConfig = {};
                        IPAMConfig['IPv4Address'] = port_value[j].IPAMConfig.IPv4Address ? port_value[j]
                            .IPAMConfig.IPv4Address : undefined;
                        IPAMConfig['IPv6Address'] = port_value[j].IPAMConfig.IPv6Address ? port_value[j]
                            .IPAMConfig.IPv6Address : undefined;

                        var LinkLocalIPs = port_value[j].IPAMConfig.LinkLocalIPs;
                        if (LinkLocalIPs.length >= 1 && LinkLocalIPs[0] != "") {
                            IPAMConfig['LinkLocalIPs'] = [];
                            for (var k in LinkLocalIPs)
                                IPAMConfig.LinkLocalIPs.push(LinkLocalIPs[k]);
                        }

                        Value['IPAMConfig'] = IPAMConfig;

                        var DriverOpts = {};
                        for (var k in port_value[j].DriverOpts)
                            DriverOpts[port_value[j].DriverOpts[k].key] = port_value[j].DriverOpts[k].value;
                        Value['DriverOpts'] = DriverOpts;
                    }
                    flag = true;
                    EndpointsConfig[inputs.NetworkingConfig.EndpointsConfig[i].key] = Value;
                }
            }

            if (flag == true) {
                networkingconfig['EndpointsConfig'] = EndpointsConfig;
                json_data['NetworkingConfig'] = networkingconfig;
            }

            if (inputs.additional_fields)
                json_data = new DockerUtils().parseAdditionalFields(inputs.additional_fields,
                    json_data);

            return json_data;
        } catch (err) {
            throw ('Invalid value provided in input variables, kindly check and try again');
        }
    },

    updateServicePayload: function(inputs) {
        var json_data = {};
        json_data.Name = inputs.name ? inputs.name : undefined;

        var labels = {};
        for (var i in inputs.Labels)
            if (inputs.Labels[i].key)
                labels[inputs.Labels[i].key] = inputs.Labels[i].value;
        json_data['Labels'] = labels;

        var TaskTemplate = {};
        TaskTemplate['ForceUpdate'] = inputs.TaskTemplate.ForceUpdate ? parseInt(inputs.TaskTemplate.ForceUpdate) : undefined;
        TaskTemplate['Runtime'] = inputs.TaskTemplate.Runtime ? inputs.TaskTemplate.Runtime : undefined;

        var PluginSpec = {};
        PluginSpec['Name'] = inputs.TaskTemplate.PluginSpec.Name ? inputs.TaskTemplate.PluginSpec.Name : undefined;
        PluginSpec['Remote'] = inputs.TaskTemplate.PluginSpec.Remote ? inputs.TaskTemplate.PluginSpec.Remote : undefined;
        PluginSpec['Disabled'] = Boolean(inputs.TaskTemplate.PluginSpec.Disabled);

        var PluginPrivilege = {};
        var PluginSpecFlag = false;
        for (var i in inputs.TaskTemplate.PluginSpec.PluginPrivilege) {
            if (inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Name) {
                PluginPrivilege[inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Name] = inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Name ? inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Name : undefined;
                PluginPrivilege[inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Description] = inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Description ? inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Description : undefined;

                var Value = inputs.TaskTemplate.PluginSpec.PluginPrivilege[i].Value;
                if (Value.length >= 1 && Value[0] != "") {
                    PluginPrivilege['Value'] = [];
                    for (var j in Value)
                        PluginPrivilege.Value.push(Value[j]);
                }
                PluginSpecFlag = true;
            }
        }
        if (PluginSpecFlag === true)
            PluginSpec['PluginPrivilege'] = PluginPrivilege;

        if (inputs.TaskTemplate.PluginSpec.Name || inputs.TaskTemplate.PluginSpec.Remote || PluginSpecFlag === true)
            TaskTemplate['PluginSpec'] = PluginSpec;

        var ContainerSpec = {};
        ContainerSpec['Image'] = inputs.TaskTemplate.ContainerSpec.Image ? inputs.TaskTemplate.ContainerSpec.Image : undefined;
        ContainerSpec['Hostname'] = inputs.TaskTemplate.ContainerSpec.Hostname ? inputs.TaskTemplate.ContainerSpec.Hostname : undefined;
        ContainerSpec['Dir'] = inputs.TaskTemplate.ContainerSpec.Dir ? inputs.TaskTemplate.ContainerSpec.Dir : undefined;
        ContainerSpec['User'] = inputs.TaskTemplate.ContainerSpec.User ? inputs.TaskTemplate.ContainerSpec.User : undefined;
        ContainerSpec['TTY'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.TTY);
        ContainerSpec['OpenStdin'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.OpenStdin);
        ContainerSpec['ReadOnly'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.ReadOnly);
        ContainerSpec['StopSignal'] = inputs.TaskTemplate.ContainerSpec.StopSignal ? inputs.TaskTemplate.ContainerSpec.StopSignal : undefined;
        ContainerSpec['StopGracePeriod'] = inputs.TaskTemplate.ContainerSpec.StopGracePeriod ? parseInt(inputs.TaskTemplate.ContainerSpec.StopGracePeriod) : undefined;
        ContainerSpec['Isolation'] = inputs.TaskTemplate.ContainerSpec.Isolation ? inputs.TaskTemplate.ContainerSpec.Isolation : undefined;
        ContainerSpec['Init'] = new DockerUtils().checkBooleanValue(inputs.TaskTemplate.ContainerSpec.Init);

        var Command = inputs.TaskTemplate.ContainerSpec.Command;
        if (Command.length >= 1 && Command[0] != "") {
            ContainerSpec['Command'] = [];
            for (var i in Command)
                ContainerSpec.Command.push(Command[i]);
        }

        var Args = inputs.TaskTemplate.ContainerSpec.Args;
        if (Args.length >= 1 && Args[0] != "") {
            ContainerSpec['Args'] = [];
            for (var i in Args)
                ContainerSpec.Args.push(Args[i]);
        }

        var Env = inputs.TaskTemplate.ContainerSpec.Env;
        if (Env.length >= 1 && Env[0] != "") {
            ContainerSpec['Env'] = [];
            for (var i in Env)
                ContainerSpec.Env.push(Env[i]);
        }

        var Groups = inputs.TaskTemplate.ContainerSpec.Groups;
        if (Groups.length >= 1 && Groups[0] != "") {
            ContainerSpec['Groups'] = [];
            for (var i in Groups)
                ContainerSpec.Groups.push(Groups[i]);
        }

        var Hosts = inputs.TaskTemplate.ContainerSpec.Hosts;
        if (Hosts.length >= 1 && Hosts[0] != "") {
            ContainerSpec['Hosts'] = [];
            for (var i in Hosts)
                ContainerSpec.Hosts.push(Hosts[i]);
        }

        var CapabilityAdd = inputs.TaskTemplate.ContainerSpec.CapabilityAdd;
        if (CapabilityAdd.length >= 1 && CapabilityAdd[0] != "") {
            ContainerSpec['CapabilityAdd'] = [];
            for (var i in CapabilityAdd)
                ContainerSpec.CapabilityAdd.push(CapabilityAdd[i]);
        }

        var CapabilityDrop = inputs.TaskTemplate.ContainerSpec.CapabilityDrop;
        if (CapabilityDrop.length >= 1 && CapabilityDrop[0] != "") {
            ContainerSpec['CapabilityDrop'] = [];
            for (var i in CapabilityDrop)
                ContainerSpec.CapabilityDrop.push(CapabilityDrop[i]);
        }

        var labels = {};
        for (var i in inputs.TaskTemplate.ContainerSpec.Labels)
            if (inputs.TaskTemplate.ContainerSpec.Labels[i].key)
                labels[inputs.TaskTemplate.ContainerSpec.Labels[i].key] = inputs.TaskTemplate.ContainerSpec.Labels[i].value;
        ContainerSpec['Labels'] = labels;

        var Privileges = {};
        var privilege = inputs.TaskTemplate.ContainerSpec.Privileges;
        var CredentialSpec = {};
        var CredentialSpecFlag = false;
        CredentialSpec['Config'] = privilege.CredentialSpec.Config ? privilege.CredentialSpec.Config : undefined;
        CredentialSpec['File'] = privilege.CredentialSpec.File ? privilege.CredentialSpec.File : undefined;
        CredentialSpec['Registry'] = privilege.CredentialSpec.Registry ? privilege.CredentialSpec.Registry : undefined;
        if (privilege.CredentialSpec.Config || privilege.CredentialSpec.File || privilege.CredentialSpec.Registry) {
            Privileges['CredentialSpec'] = CredentialSpec;
            CredentialSpecFlag = true;
        }

        var SELinuxContext = {};
        var SELinuxContextFlag = false;
        SELinuxContext['Disable'] = Boolean(privilege.SELinuxContext.Disable);
        SELinuxContext['User'] = privilege.SELinuxContext.User ? privilege.SELinuxContext.User : undefined;
        SELinuxContext['Role'] = privilege.SELinuxContext.Role ? privilege.SELinuxContext.Role : undefined;
        SELinuxContext['Type'] = privilege.SELinuxContext.Type ? privilege.SELinuxContext.Type : undefined;
        SELinuxContext['Level'] = privilege.SELinuxContext.Level ? privilege.SELinuxContext.Level : undefined;
        if (privilege.SELinuxContext.User && privilege.SELinuxContext.Role && privilege.SELinuxContext.Type && privilege.SELinuxContext.Level) {
            Privileges['SELinuxContext'] = SELinuxContext;
            SELinuxContextFlag = true;
        }

        if (CredentialSpecFlag === true || SELinuxContextFlag === true)
            ContainerSpec['Privileges'] = Privileges;

        ContainerSpec['Mounts'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Mounts) {
            var Mounts = {};
            var mount = inputs.TaskTemplate.ContainerSpec.Mounts[i];
            Mounts['Target'] = mount.Target ? mount.Target : undefined;
            Mounts['Source'] = mount.Source ? mount.Source : undefined;
            Mounts['Type'] = mount.Type ? mount.Type : undefined;
            Mounts['ReadOnly'] = new DockerUtils().checkBooleanValue(mount.ReadOnly);
            Mounts['Consistency'] = mount.Consistency ? mount.Consistency : undefined;

            var BindOptions = {};
            var BindFlag = false;
            if (mount.BindOptions.Propagation && mount.BindOptions.NonRecursive) {
                BindOptions['Propagation'] = mount.BindOptions.Propagation ? mount.BindOptions.Propagation : undefined;
                BindOptions['NonRecursive'] = new DockerUtils().checkBooleanValue(mount.BindOptions.NonRecursive);
                BindFlag = true;
                Mounts['BindOptions'] = BindOptions;
            }

            var VolumeOptions = {};
            var VolumeFlag = false;
            var VolumeOptionsFlag = false;
            VolumeOptions['NoCopy'] = new DockerUtils().checkBooleanValue(mount.VolumeOptions.NoCopy);
            var VolumeOptionsLabels = {};
            for (var j in mount.VolumeOptions.Labels)
                if (mount.VolumeOptions.Labels[j].key) {
                    VolumeOptionsLabels[mount.VolumeOptions.Labels[j].key] = mount.VolumeOptions.Labels[j].value;
                    VolumeOptionsFlag = true;
                }
            if (VolumeOptionsFlag == true)
                VolumeOptions['Labels'] = VolumeOptionsLabels;

            var VolumeOptionsDriverConfig = {};
            VolumeOptionsDriverConfig['Name'] = mount.VolumeOptions.DriverConfig
                .Name ? mount.VolumeOptions.DriverConfig.Name : undefined;
            var OptionsFlag = false;
            for (var j in mount.VolumeOptions.DriverConfig.Options) {
                if (mount.VolumeOptions.DriverConfig.Options[j].key) {
                    var VolumeOptionsDriverConfigOptions = {};
                    VolumeOptionsDriverConfigOptions[mount.VolumeOptions
                            .DriverConfig.Options[j].key] = mount.VolumeOptions
                        .DriverConfig.Options[j].value;

                    VolumeOptionsDriverConfig['Options'] = VolumeOptionsDriverConfigOptions;
                    OptionsFlag = true;
                }
            }
            if (VolumeOptionsDriverConfig.Name && OptionsFlag == true)
                VolumeOptions['DriverConfig'] = VolumeOptionsDriverConfig;

            if (VolumeOptions.DriverConfig && VolumeOptions.Labels) {
                Mounts['VolumeOptions'] = VolumeOptions;
                VolumeFlag = true;
            }

            var TmpfsOptions = {};
            var TmpfsFlag = false;
            TmpfsOptions['SizeBytes'] = mount.TmpfsOptions.SizeBytes ? parseInt(mount.TmpfsOptions.SizeBytes) : undefined;
            TmpfsOptions['Mode'] = mount.TmpfsOptions.Mode ? parseInt(mount.TmpfsOptions.Mode) : undefined;
            if (mount.TmpfsOptions.SizeBytes && mount.TmpfsOptions.Mode) {
                Mounts['TmpfsOptions'] = TmpfsOptions;
                TmpfsFlag = true;
            }

            if (mount.Target || mount.Source || mount.Type || mount.ReadOnly || mount.Consistency || BindFlag === true || VolumeFlag === true || TmpfsFlag === true)
                ContainerSpec.Mounts.push(Mounts);
        }

        var healthcheck = {};
        var test = inputs.TaskTemplate.ContainerSpec.HealthCheck.Test;
        var testFlag = false;
        if (test.length >= 1 && test[0] != "") {
            healthcheck['Test'] = [];
            for (var i in test) {
                healthcheck.Test.push(test[i]);
                testFlag = true;
            }
        }
        var health = inputs.TaskTemplate.ContainerSpec.HealthCheck;
        healthcheck['Interval'] = health.Interval ? parseInt(health.Interval) : undefined;
        healthcheck['Timeout'] = health.Timeout ? parseInt(health.Timeout) : undefined;
        healthcheck['Retries'] = health.Retries ? parseInt(health.Retries) : undefined;
        healthcheck['StartPeriod'] = health.StartPeriod ? parseInt(health.StartPeriod) : undefined;
        if (health.Interval || health.Timeout || health.Retries || health.StartPeriod || testFlag === true)
            ContainerSpec['HealthCheck'] = healthcheck;

        var DNSConfig = {};
        var Nameservers = inputs.TaskTemplate.ContainerSpec.DNSConfig.Nameservers;
        var NameserversFlag = false;
        if (Nameservers.length >= 1 && Nameservers[0] != "") {
            DNSConfig['Nameservers'] = [];
            for (var i in Nameservers) {
                DNSConfig.Nameservers.push(Nameservers[i]);
                NameserversFlag = true;
            }
        }

        var Search = inputs.TaskTemplate.ContainerSpec.DNSConfig.Search;
        var SearchFlag = false;
        if (Search.length >= 1 && Search[0] != "") {
            DNSConfig['Search'] = [];
            for (var i in Search) {
                DNSConfig.Search.push(Search[i]);
                SearchFlag = true;
            }
        }

        var Options = inputs.TaskTemplate.ContainerSpec.DNSConfig.Options;
        var OptionsFlag = false;
        if (Options.length >= 1 && Options[0] != "") {
            DNSConfig['Options'] = [];
            for (var i in Options) {
                DNSConfig.Options.push(Options[i]);
                OptionsFlag = true;
            }
        }

        if (NameserversFlag === true || SearchFlag === true || OptionsFlag === true)
            ContainerSpec['DNSConfig'] = DNSConfig;

        ContainerSpec['Secrets'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Secrets) {
            var Secrets = {};
            var secret = inputs.TaskTemplate.ContainerSpec.Secrets[i];
            Secrets['SecretID'] = secret.SecretID ? secret.SecretID : undefined;
            Secrets['SecretName'] = secret.SecretName ? secret.SecretName : undefined;

            var File = {};
            File['Name'] = secret.File.Name ? secret.File.Name : undefined;
            File['UID'] = secret.File.UID ? secret.File.UID : undefined;
            File['GID'] = secret.File.GID ? secret.File.GID : undefined;
            File['Mode'] = secret.File.Mode ? parseInt(secret.File.Mode) : undefined;
            if (secret.File.Name || secret.File.UID || secret.File.GID || secret.File.Mode)
                Secrets['File'] = File;

            if (secret.SecretID || secret.SecretName)
                ContainerSpec.Secrets.push(Secrets);
        }

        ContainerSpec['Configs'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Configs) {
            var Configs = {};
            var config = inputs.TaskTemplate.ContainerSpec.Configs[i];
            Configs['ConfigID'] = config.ConfigID ? config.ConfigID : undefined;
            Configs['ConfigName'] = config.ConfigName ? config.ConfigName : undefined;
            Configs['Runtime'] = config.Runtime ? JSON.parse(config.Runtime) : undefined;

            var File = {};
            File['Name'] = config.File.Name ? config.File.Name : undefined;
            File['UID'] = config.File.UID ? config.File.UID : undefined;
            File['GID'] = config.File.GID ? config.File.GID : undefined;
            File['Mode'] = config.File.Mode ? parseInt(config.File.Mode) : undefined;
            if (config.File.Name || config.File.UID || config.File.GID || config.File.Mode)
                Configs['File'] = File;

            if (config.ConfigID || config.ConfigName)
                ContainerSpec.Configs.push(Configs);
        }

        var Sysctls = {};
        for (var i in inputs.TaskTemplate.ContainerSpec.Sysctls)
            if (inputs.TaskTemplate.ContainerSpec.Sysctls[i].key)
                labels[inputs.TaskTemplate.ContainerSpec.Sysctls[i].key] = inputs.TaskTemplate.ContainerSpec.Sysctls[i].value;
        ContainerSpec['Sysctls'] = Sysctls;

        ContainerSpec['Ulimits'] = [];
        for (var i in inputs.TaskTemplate.ContainerSpec.Ulimits) {
            var Ulimits = {};
            var ulimit = inputs.TaskTemplate.ContainerSpec.Ulimits[i];
            Ulimits['Name'] = ulimit.Name ? ulimit.Name : undefined;
            Ulimits['Soft'] = ulimit.Soft ? parseInt(ulimit.Soft) : undefined;
            Ulimits['Hard'] = ulimit.Hard ? parseInt(ulimit.Hard) : undefined;
            if (ulimit.Name && ulimit.Soft && ulimit.Hard)
                ContainerSpec.Ulimits.push(Ulimits);
        }

        if (inputs.TaskTemplate.ContainerSpec.Image)
            TaskTemplate['ContainerSpec'] = ContainerSpec;

        var NetworkAttachmentSpec = {};
        NetworkAttachmentSpec['Mode'] = inputs.TaskTemplate.NetworkAttachmentSpec.Mode ? parseInt(inputs.TaskTemplate.NetworkAttachmentSpec.Mode) : undefined;
        if (inputs.TaskTemplate.NetworkAttachmentSpec.Mode)
            TaskTemplate['NetworkAttachmentSpec'] = NetworkAttachmentSpec;

        var Resources = {};
        var Limits = {};
        var limit = inputs.TaskTemplate.Resources.Limits;
        Limits['NanoCPUs'] = limit.NanoCPUs ? parseInt(limit.NanoCPUs) : undefined;
        Limits['MemoryBytes'] = limit.MemoryBytes ? parseInt(limit.MemoryBytes) : undefined;
        Limits['Pids'] = limit.Pids ? parseInt(limit.Pids) : undefined;
        if (limit.NanoCPUs || limit.MemoryBytes || limit.Pids)
            Resources['Limits'] = Limits;

        var Reservation = {};
        var reserv = inputs.TaskTemplate.Resources.Reservation;
        Reservation['NanoCPUs'] = reserv.NanoCPUs ? parseInt(reserv.NanoCPUs) : undefined;
        Reservation['MemoryBytes'] = reserv.MemoryBytes ? parseInt(reserv.MemoryBytes) : undefined;

        Reservation['GenericResources'] = [];
        var GenericFlag = false;
        for (var i in inputs.TaskTemplate.Resources.Reservation.GenericResources) {
            var GenericResources = {};
            var genericR = inputs.TaskTemplate.Resources.Reservation.GenericResources[i];

            var NamedResourceSpec = {};
            var NamedResourceFlag = false;
            NamedResourceSpec['Kind'] = genericR.NamedResourceSpec.Kind ? genericR.NamedResourceSpec.Kind : undefined;
            NamedResourceSpec['Value'] = genericR.NamedResourceSpec.Value ? genericR.NamedResourceSpec.Value : undefined;
            if (genericR.NamedResourceSpec.Kind && genericR.NamedResourceSpec.Value) {
                GenericResources['NamedResourceSpec'] = NamedResourceSpec;
                NamedResourceFlag = true;
            }

            var DiscreteResourceSpec = {};
            var DiscreteResourceFlag = false;
            DiscreteResourceSpec['Kind'] = genericR.DiscreteResourceSpec.Kind ? genericR.DiscreteResourceSpec.Kind : undefined;
            DiscreteResourceSpec['Value'] = genericR.DiscreteResourceSpec.Value ? parseInt(genericR.DiscreteResourceSpec.Value) : undefined;
            if (genericR.DiscreteResourceSpec.Kind && genericR.DiscreteResourceSpec.Value) {
                GenericResources['DiscreteResourceSpec'] = DiscreteResourceSpec;
                DiscreteResourceFlag = true;
            }

            if (NamedResourceFlag === true && DiscreteResourceFlag === true)
                Reservation.GenericResources.push(GenericResources);

            GenericFlag = true;
        }

        if (limit.NanoCPUs || limit.MemoryBytes || GenericFlag === true)
            Resources['Reservation'] = Reservation;

        if (Resources.Limits || Resources.Reservation)
            TaskTemplate['Resources'] = Resources;

        var RestartPolicy = {};
        var restartP = inputs.TaskTemplate.RestartPolicy;
        RestartPolicy['Condition'] = restartP.Condition ? restartP.Condition : undefined;
        RestartPolicy['Delay'] = restartP.Delay ? parseInt(restartP.Delay) : undefined;
        RestartPolicy['MaxAttempts'] = restartP.MaxAttempts ? parseInt(restartP.MaxAttempts) : undefined;
        RestartPolicy['Window'] = restartP.Window ? parseInt(restartP.Window) : undefined;
        if (restartP.Condition || restartP.Delay || restartP.MaxAttempts || restartP.Window)
            TaskTemplate['RestartPolicy'] = RestartPolicy;

        var Placement = {};
        var placeM = inputs.TaskTemplate.Placement;
        Placement['MaxReplicas'] = placeM.MaxReplicas ? parseInt(placeM.MaxReplicas) : undefined;

        var Constraints = placeM.Constraints;
        var constraintsFlag = false;
        if (Constraints.length >= 1 && Constraints[0] != "") {
            Placement['Constraints'] = [];
            for (var i in Constraints) {
                Placement.Constraints.push(Constraints[i]);
                constraintsFlag = true;
            }
        }

        Placement['Preferences'] = [];
        var PreferencesFlag = false;
        for (var i in placeM.Preferences) {
            var Preferences = {};
            var prefer = placeM.Preferences[i];
            var Spread = {};
            Spread['SpreadDescriptor'] = prefer.Spread.SpreadDescriptor ? prefer.Spread.SpreadDescriptor : undefined;
            if (prefer.Spread.SpreadDescriptor)
                Preferences['Spread'] = Spread;

            if (prefer.Spread) {
                Placement.Preferences.push(Preferences);
                PreferencesFlag = true;
            }
        }

        Placement['Platforms'] = [];
        var PlatformsFlag = false;
        for (var i in placeM.Platforms) {
            var Platforms = {};
            var platF = placeM.Platforms[i];
            Platforms['Architecture'] = platF.Architecture ? platF.Architecture : undefined;
            Platforms['OS'] = platF.OS ? platF.OS : undefined;

            if (platF.Architecture || platF.OS) {
                Placement.Platforms.push(Platforms);
                PlatformsFlag = true;
            }
        }

        if (placeM.MaxReplicas || constraintsFlag === true || PreferencesFlag === true || PlatformsFlag === true)
            TaskTemplate['Placement'] = Placement;

        TaskTemplate['Networks'] = [];
        var NetworksFlag = false;
        for (var i in inputs.TaskTemplate.Networks) {
            var Networks = {};
            var network = inputs.TaskTemplate.Networks[i];
            Networks['Target'] = network.Target ? network.Target : undefined;

            var Aliases = network.Aliases;
            var AliasesFlag = false;
            if (Aliases.length >= 1 && Aliases[0] != "") {
                Networks['Aliases'] = [];
                for (var i in Aliases) {
                    Networks.Aliases.push(Aliases[i]);
                    AliasesFlag = true;
                }
            }

            var DriverOpts = {};
            var DriverOptsFlag = false;
            for (var j in network.DriverOpts)
                if (network.DriverOpts[j].key) {
                    DriverOpts[network.DriverOpts[j].key] = network.DriverOpts[j].value;
                    DriverOptsFlag = true;
                }
            if (DriverOptsFlag === true)
                Networks['DriverOpts'] = DriverOpts;

            if (network.Target || AliasesFlag === true || DriverOptsFlag === true) {
                TaskTemplate.Networks.push(Networks);
                NetworksFlag = true;
            }
        }

        var LogDriver = {};
        LogDriver['Name'] = inputs.TaskTemplate.LogDriver.Name ? inputs.TaskTemplate.LogDriver.Name : undefined;

        var Options = {};
        var OptionsFlag = false;
        for (var i in inputs.TaskTemplate.LogDriver.Options)
            if (inputs.TaskTemplate.LogDriver.Options[i].key) {
                Options[inputs.TaskTemplate.LogDriver.Options[i].key] = inputs.TaskTemplate.LogDriver.Options[i].value;
                OptionsFlag = true;
            }
        if (OptionsFlag === true)
            LogDriver['Options'] = Options;

        if (inputs.TaskTemplate.LogDriver.Name || OptionsFlag === true)
            TaskTemplate['LogDriver'] = LogDriver;

        if (inputs.TaskTemplate.ContainerSpec.Image)
            json_data['TaskTemplate'] = TaskTemplate;

        var Mode = {};
        var Replicated = {};
        if ((inputs.mode) && (inputs.mode.Replicated) && (inputs.mode.Replicated.Replicas))
            Replicated['Replicas'] = inputs.mode.Replicated.Replicas;
        else
            Replicated['Replicas'] = 0;
        Mode['Replicated'] = Replicated;
        json_data['Mode'] = Mode;

        var UpdateConfig = {};
        UpdateConfig['Parallelism'] = inputs.UpdateConfig.Parallelism ? parseInt(inputs.UpdateConfig.Parallelism) : undefined;
        UpdateConfig['Delay'] = inputs.UpdateConfig.Delay ? parseInt(inputs.UpdateConfig.Delay) : undefined;
        UpdateConfig['FailureAction'] = inputs.UpdateConfig.FailureAction ? inputs.UpdateConfig.FailureAction : undefined;
        UpdateConfig['Monitor'] = inputs.UpdateConfig.Monitor ? parseInt(inputs.UpdateConfig.Monitor) : undefined;
        UpdateConfig['MaxFailureRatio'] = inputs.UpdateConfig.MaxFailureRatio ? parseInt(inputs.UpdateConfig.MaxFailureRatio) : undefined;
        if (inputs.UpdateConfig.Parallelism || inputs.UpdateConfig.Delay || inputs.UpdateConfig.FailureAction || inputs.UpdateConfig.Monitor || inputs.UpdateConfig.MaxFailureRatio)
            json_data['UpdateConfig'] = UpdateConfig;

        var RollbackConfig = {};
        RollbackConfig['Parallelism'] = inputs.RollbackConfig.Parallelism ? parseInt(inputs.RollbackConfig.Parallelism) : undefined;
        RollbackConfig['Delay'] = inputs.RollbackConfig.Delay ? parseInt(inputs.RollbackConfig.Delay) : undefined;
        RollbackConfig['FailureAction'] = inputs.RollbackConfig.FailureAction ? inputs.RollbackConfig.FailureAction : undefined;
        RollbackConfig['Monitor'] = inputs.RollbackConfig.Monitor ? parseInt(inputs.RollbackConfig.Monitor) : undefined;
        RollbackConfig['MaxFailureRatio'] = inputs.RollbackConfig.MaxFailureRatio ? parseInt(inputs.RollbackConfig.MaxFailureRatio) : undefined;
        if (inputs.RollbackConfig.Parallelism || inputs.RollbackConfig.Delay || inputs.RollbackConfig.FailureAction || inputs.RollbackConfig.Monitor || inputs.RollbackConfig.MaxFailureRatio)
            json_data['RollbackConfig'] = RollbackConfig;

        json_data['Networks'] = [];
        for (var i in inputs.networks) {
            var Networks = {};
            var network = inputs.networks[i];
            Networks['Target'] = network.Target ? network.Target : undefined;

            if (network.Target)
                json_data.Networks.push(Networks);
        }

        var EndpointSpec = {};
        EndpointSpec['Mode'] = inputs.EndpointSpec.Mode ? inputs.EndpointSpec.Mode : undefined;

        EndpointSpec['Ports'] = [];
        var PortFlag = false;
        for (var i in inputs.EndpointSpec.Ports) {
            var Ports = {};
            var port = inputs.EndpointSpec.Ports[i];
            Ports['Name'] = port.Name ? port.Name : undefined;
            Ports['Protocol'] = port.Protocol ? port.Protocol : undefined;
            Ports['TargetPort'] = port.TargetPort ? parseInt(port.TargetPort) : undefined;
            Ports['PublishedPort'] = port.PublishedPort ? parseInt(port.PublishedPort) : undefined;
            Ports['PublishMode'] = port.PublishMode ? port.PublishMode : undefined;

            if (port.Target || port.Protocol || port.TargetPort || port.PublishedPort || port.PublishMode) {
                EndpointSpec.Ports.push(Ports);
                PortFlag = true;
            }
        }

        if (inputs.EndpointSpec.Mode || PortFlag === true)
            json_data['EndpointSpec'] = EndpointSpec;

        return json_data;
    },

    type: 'DockerUtils'
};
