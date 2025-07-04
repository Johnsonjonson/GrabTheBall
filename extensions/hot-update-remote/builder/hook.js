
'use strict';

const os = require("os");
const fs = require("fs");
const path = require("path");
const { exec } = require('child_process');

exports.onAfterBuild = function (options, result) {
    if(options.platform != 'google-play') {
        return
    }
    let resdir = 'assets';

    if (fs.existsSync(path.join(result.dest, 'data'))) {
        resdir = 'data';
    }
    console.warn("hotfix-local-ip");
    var url = path.join(Editor.Project.path, "assets/Framework/ResUpdate", 'ResConfig.ts');
    fs.readFile(url, "utf8", function (err, data) {
        if (err) {
            throw err;
        }
        let GameVersion,ServerUrl,ServerPath
        
        let infoList = data.split('\n')
        infoList.forEach((value)=> {
            let realValue = value.slice(value.indexOf("\"")+1, value.lastIndexOf("\""))
            if(value.match("GameVersion")) {
                GameVersion = realValue
            } else if(value.match("ServerUrl")) {
                ServerUrl = realValue
            } else if(value.match("ServerPath")) {
                ServerPath = realValue
            }
        })

        console.warn("GameVersion:" + GameVersion);
        console.warn("ServerUrl:" + ServerUrl);
        console.warn("ServerPath:" + ServerPath);
        let cmd = `node version_generator.js -v ${GameVersion} -u ${ServerUrl}/${ServerPath} -s ${path.join(result.dest, resdir)} -d ${path.join(Editor.Project.path, "assets")}`    
        console.warn(cmd);
    
        exec(cmd, { cwd: Editor.Project.path }, (err, stdout, stderr) => {
            if (!err) return;
            console.error(err);
        });
    });
}
