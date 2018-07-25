const exec = require('child_process').exec;

/**
 * Task killer. Kill hanged drivers
 * @type {TaskKiller}
 */
class TaskKiller {

    /**
     * Kill hang driver
     * @param {Array<string>} itemToKill - list of items to kill
     * @return {Promise<void>} - promise that resolves after killing drivers
     */
    static kill(itemToKill) {
        const CMD_LIST = "tasklist /V /FO CSV";
        const KILL = "taskkill /F /PID ";

        return new Promise((resolve, reject) => {
            exec(CMD_LIST, (error, stdout) => {
                if (error) reject(error);

                stdout
                    .split("\r\n")
                    .filter(process => itemToKill.find(item => process.includes(item)))
                    .map(item => item.split(/,/)[1].replace(/"/g, ""))
                    .forEach(pid => exec(KILL + pid, error => {
                        if (error) reject(error);
                        console.log("Process with id " + pid + " killed");
                    }));

                resolve();
            })
        });
    }

    static killWebdriver(port) {
        const CMD_LIST = "netstat -ano | findstr \":" + port + "\"";
        const KILL = "taskkill /F /PID ";

        return new Promise((resolve, reject) => {
            exec(CMD_LIST, (error, stdout) => {
                if (error) {
                    if (error.message.includes("Command failed")) {
                        resolve()
                    } else {
                        reject(error);
                    }
                }

                if (stdout) {
                    const processRecord = stdout
                        .split("\r\n")
                        .find(process => process.includes(":" + port));

                    if (processRecord) {
                        const splitProcessRecord = processRecord.split(/\s+/g);
                        const pid = splitProcessRecord[splitProcessRecord.length - 1];
                        exec(KILL + pid, error => {
                            if (error) reject(error);
                            console.log("Process with id " + pid + " killed");
                        })
                    }
                }

                resolve();
            })
        });
    }
}

module.exports = TaskKiller;