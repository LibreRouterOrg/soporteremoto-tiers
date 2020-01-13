require('dotenv').config()
const db = require('../src/db')
const log = require('fancy-log')
const logSymbols = require('log-symbols')
const Table = require('cli-table')
const args = require('args')
const SshClient = require('ssh2').Client

const listKeys = (cb) => {

    const { apiKey, connect } = args.parse(process.argv)

    if(!apiKey && typeof connect === 'undefined') {        
        const table = new Table({
            head: ['Api key', 'Community', 'Device'],
            colWidths: [15, 40, 40]
        });

        db.createReadStream({ keys: true, values: true })
            .on('data', (data) => {
                const key = data.key
                data = JSON.parse(data.value) 
                table.push([key, data.communityName? data.communityName: '', data.device? data.device.name: ''])
            })
            .on('close', () => {
                console.log(table.toString())
            })
    } else if (typeof connect === 'undefined' ) {
        db.get(apiKey, (error, data) => {
            if (error) { return log(logSymbols.error, 'API key not found') }
            try {
                data = JSON.parse(data)
                
                if(!data.keys) { return log(data.communityName + 'doesn\'t have any keys installed yet.')}
                
                log('Privates ssh keys for '+ data.communityName)
                const table = new Table({
                    head: ['id', 'ssh key', 'ips']
                });

                data.keys.forEach((sshInfo, id) => {
                    const ips = data.requests
                        ? data.requests.reduce((prev,act) => {
                            try {
                                return act.librenet6? prev.concat(act.librenet6.ip).concat('\n') : prev
                            }
                            catch (e) {
                                return prev
                            }
                        },'')
                        : ''
                        console.log(ips)
                    table.push([id, sshInfo.keys.private, ips])
                });
                
                console.log(table.toString())
                
            } catch (e) {
                return log(logSymbols.error, 'Possible data corruption', e)
            }
        })
    } else {
        db.get(apiKey, (error, data) => {
            if (error) { return log(logSymbols.error, 'API key not found') }
            try {
                data = JSON.parse(data)
                
                if(!data.keys || typeof data.keys[connect] === 'undefined' ) { return log('key not found')}
                
                
                log(logSymbols.info, 'Trying to connect to '+data.communityName)

                const privateKey = data.keys[connect].private

                const conn = new SshClient();
                conn
                    .on('ready', function() {
                        console.log('Client :: ready');
                        conn.shell(function(err, stream) {
                            if (err) throw err;
                
                            const stdinListener = (data) => {
                                skipNext = true;
                                stream.stdin.write(data);
                            };
                
                            stream.on('close', function() {
                                process.stdin.removeListener("data", stdinListener)
                                log(logSymbols.warning, 'Connection close')
                                conn.end();
                                process.exit()
                                return
                            }).stderr.on('data', function(data) {
                                process.stdin.removeListener("data", stdinListener)
                                conn.end();
                                log(logSymbols.error, 'Error in connection')
                            });
                
                            // skip next stops double printing of input
                            let skipNext = false;
                            stream.stdout.on("data", (data) => {
                                if (skipNext) { return skipNext = false; }
                                process.stdout.write(data);
                            })        
                            process.stdin.on("data", stdinListener)
                        });
                    })
                    .connect({
                        host: data.keys[connect].ip,
                        username: "root",
                        privateKey
                    });

            } catch (e) {
                console.log(e)
                return log(logSymbols.error, 'Unable to connect')
            }
        })
    }
}

if(process.env.NODE_ENV !== 'test') {
    args
        .option('apiKey', 'Get ssh private key list')
        .option('connect', 'Connect using X private key')
    listKeys((result)=>{
        if (!result) return;
        if(result.error) {
            return log(logSymbols.error, result.error)
        }
        return log(logSymbols.success, result.successs)
    })
}

module.exports = {
    listKeys
}