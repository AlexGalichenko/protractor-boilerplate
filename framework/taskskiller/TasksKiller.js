"use strict";
const exec = require('child_process').exec;

class TaskKiller {

    /**
     * Kill hang driver
     * @param itemToKill {Array<String>} - list of items to kill
     */
    static kill(itemToKill) {
        const CMD_LIST = "tasklist /V /FO CSV";
        const KILL = "taskkill /F /PID ";

        exec(CMD_LIST, (error, stdout, stderr) => {
            if (error) throw error;

            const filteredList = stdout.split("\r\n").filter((process) => {
                return itemToKill.find((item) => {
                    return process.includes(item)
                });
            });

            const pids = filteredList.map((item) => {
                return item.split(/,/)[1].replace(/"/g, "")
            });

            pids.forEach((pid) => {
                exec(KILL + pid, (error, stdout, stderr) => {
                    if (error) throw error;
                    console.log(stdout);
                });
            })
        })
    }
}

module.exports = TaskKiller;