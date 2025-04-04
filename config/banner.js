const figlet = require('figlet');
const chalk = require('chalk').default;

function displayBanner() {
    const banner = figlet.textSync('Crypto Kidzs', {
        font: 'Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: false,
    });
    console.log(chalk.green(banner));
    console.log(chalk.cyan('=========================================='));
    console.log(chalk.magenta('Github   : https://github.com/CryptoKidzz'));
    console.log(chalk.magenta('Telegram : https://t.me/CryptoKidzs'));
    console.log(chalk.cyan('=========================================='));
}
displayBanner();