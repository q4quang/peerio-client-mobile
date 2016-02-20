'use strict';
var fs = require('fs');
var xcode = require('xcode');
var diff = require('deep-diff');

function log(msg) {
    console.log(msg);
    return true;
}

function error(msg) {
    throw msg;
}

function findBasicNodes(info) {
    info.hasChanges = false;
    findRoot(info);
    findDefaultTarget(info);
    findSystemCapabilities(info);
    findBuildConfiguration(info);
}

function findRoot(info) {
    info.root = info.projectFile.hash.project.rootObject;
    info.root && log('Determined project id ' + info.root);
    info.rootProject = info.projectFile.hash.project.objects.PBXProject[info.root];
    info.rootProject && log('Found root project') || error('no root project');
}

function findDefaultTarget(info) {
    info.defaultTarget = info.rootProject.targets[0];
    info.defaultTarget && log('Determined default target ' + info.defaultTarget.value + ' ' + info.defaultTarget.comment);
    info.targetAttributes = info.rootProject.attributes.TargetAttributes && info.rootProject.attributes.TargetAttributes[info.defaultTarget.value];
    info.targetAttributes && log('Found target attributes') || log('No target attributes exist yet in project');
    info.nativeTargetStorage = info.projectFile.hash.project.objects.PBXNativeTarget;
    info.nativeTargetStorage && log('Found native target storage') || error('Native target storage not found');
    info.nativeTarget = info.nativeTargetStorage[info.defaultTarget.value];
    info.nativeTarget && log('Found native target') || error('Native target not found');
}

function findBuildConfiguration(info) {
    log('Finding build configuration');
    info.configurationList = info.projectFile.hash.project.objects.XCConfigurationList;
    info.configurationList && log('Found configuration list') || error('Configuration list not found');
    info.targetConfigurationList = info.configurationList[info.nativeTarget.buildConfigurationList].buildConfigurations;
    info.targetConfigurationList && log('Found target configuration for target') || error('Could not find target configuration');
    info.buildConfiguration = info.projectFile.hash.project.objects.XCBuildConfiguration;
    info.buildConfiguration && log('Found build configuration storage') || error('Could not find build configuration storage');
    info.targetConfigurationList.forEach( (conf) => {
        var config = info.buildConfiguration[conf.value];
        config && log('Found configuration ' + conf.value + ', ' + conf.comment) || error('Error resolving ' + conf.value + ', ' + conf.comment);
        if(conf.comment === 'Debug') { 
            info.debugConfiguration = config; 
            log('Found debug configuration');
        }
        if(conf.comment === 'Release') {
            info.releaseConfiguration = config; 
            log('Found release configuration');
        }
    });
}

function applyBuildValue(info, build, name, value) {
    if(typeof build[name] !== 'undefined') {
        log('Found build settings: ' + name + '=' + build[name]);
    }

    if(build[name] !== value) {
        log('Value differs. Updating to: ' + value);
        build[name] = value;
        info.hasChanged = true;
    }
}

function applyAllBuildSettingsValue(info, name, value) {
    log('Applying ' + name + '=' + value + ' to debug');
    applyBuildValue(info, info.debugConfiguration.buildSettings, name, value);
    log('Applying ' + name + '=' + value + ' to release');
    applyBuildValue(info, info.releaseConfiguration.buildSettings, name, value);
}

function applyAllBuildValue(info, name, value) {
    log('Applying ' + name + '=' + value + ' to debug');
    applyBuildValue(info, info.debugConfiguration, name, value);
    log('Applying ' + name + '=' + value + ' to release');
    applyBuildValue(info, info.releaseConfiguration, name, value);
}

function findSystemCapabilities(info) {
    log('Checking system capabilities 2');
    info.systemCapabilities = info.targetAttributes && info.targetAttributes.SystemCapabilities;
    if(info.systemCapabilities) {
        log('Found system capabilities');
    } else {
        log('System capabilities node not found');
    }
}

function createTargetAttributes(info) {
    info.targetAttributes = {};
    info.targetAttributes[info.defaultTarget.value] = {};
    info.rootProject.attributes.TargetAttributes = info.targetAttributes;
    info.targetAttributes = info.targetAttributes[info.defaultTarget.value];
    info.hasChanged = true;
    log('Created target attributes');
}

function createSystemCapabilities(info) {
    info.systemCapabilities = {};
    info.targetAttributes.SystemCapabilities = info.systemCapabilities;
    info.hasChanged = true;
    log('Created system capabilities');
}

function enableSystemCapability(info, name) {
    info.targetAttributes || createTargetAttributes(info);
    info.systemCapabilities || createSystemCapabilities(info);
    log('Checking ' + name);
    var capability = info.systemCapabilities[name];
    if(!capability) {
        log('Creating capability');
        capability = {};
        info.systemCapabilities[name] = capability;
        info.hasChanged = true;
    }
    if(capability.enabled !== 1) {
        log('Enabling capability');
        capability.enabled = 1;
        info.hasChanged = true;
    } else {
        log('Capability ' + name + ' already enabled. Skipping');
    }
}


function setDevelopmentTeam(info, team) {
    info.targetAttributes || error('no target attributes');
    if(info.targetAttributes.DevelopmentTeam) {
        log('Found development team: ' + info.targetAttributes.DevelopmentTeam);
    } else {
        log('Development team not found');
    }
    if(info.targetAttributes.DevelopmentTeam !== team) {
        log('Team is not equal to target value. Setting to: ' + team);
        info.targetAttributes.DevelopmentTeam = team;
        info.hasChanged = true;
    } else {
        log('Team value equals to: ' + team + '. Skipping');
    }
}

function load(filePath) {
    return new Promise( (resolve, reject) => {
        filePath || error('no file path specified');
        var projectFile = xcode.project(filePath);
        projectFile.parse( (error) => {
            if(error) reject(error);
            resolve(projectFile);
        });
    });
}

function write(info) {
    if(!info.hasChanged) {
        log('no changes to write');
        return true;
    }
    log('preparing to write');
    fs.writeFileSync(info.path, info.projectFile.writeSync());
    log('written path: ' + info.path);
}


function apply(params) {
    var projectFilePath = params.path;
    load(projectFilePath)
    .then( (projectFile) => {
        var info = {};
        info.path = projectFilePath;
        info.projectFile = projectFile;
        findBasicNodes(info);
        params.dataProtection && enableSystemCapability(info, 'com.apple.DataProtection');
        params.push && enableSystemCapability(info, 'com.apple.Push');
        params.team && setDevelopmentTeam(info, params.team);
        params.disableBitcode && applyAllBuildSettingsValue(info, 'ENABLE_BITCODE', 'NO');
        params.profile && applyAllBuildSettingsValue(info, 'PROVISIONING_PROFILE', params.profile);
        return info;
    })
    .then(write)
    .catch( (error) => {
        log('Error: ' + error);
    });
    return true;
}

function diff(path1, path2) {
    var file1 = null, file2 = null;
    load(path1)
    .then( file => {
        file1 = file;
        return load(path2);
    })
    .then( file => {
        file2 = file;
        return true;
    })
    .then( () => {
        return diff(file1, file2);
    });
}

exports.apply = apply;
exports.diff = diff;
exports.load = load;
