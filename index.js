const fs = require('fs');
const axios = require('axios');
const chalk = require('chalk').default;

const COOKIE_PATH = 'data.txt';
const POINTS_URL = 'https://app.mahojin.ai/api/point';
const CLAIM_URL = 'https://app.mahojin.ai/api/point/claim';
const GENERATE_URL = 'https://app.mahojin.ai/api/generate-image';
const PROMPT_URL = 'https://d1kfhpz1mqv5dj.cloudfront.net/random_prompts/k9BTuYpmVpYUnYs3uHH4Q.json';
const POINT_COST = 40;
const ASPECT_RATIO = { label: "Square", width: 1024, height: 1024 };
const CLAIM_INTERVAL = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
const CLAIM_LOG = 'last_claim.txt';

// Cek kapan terakhir kali klaim poin
const lastClaimTime = () => {
    if (fs.existsSync(CLAIM_LOG)) {
        return parseInt(fs.readFileSync(CLAIM_LOG, 'utf8')) || 0;
    }
    return 0;
};

// Simpan waktu klaim terakhir
const saveClaimTime = () => {
    fs.writeFileSync(CLAIM_LOG, Date.now().toString());
};

// Ambil cookie dari file
const getCookies = () => {
    try {
        return fs.readFileSync(COOKIE_PATH, 'utf8').trim();
    } catch {
        return '';
    }
};

// Header untuk request API
const getHeaders = () => ({
    'Referer': 'https://app.mahojin.ai/images?sortBy=featured&creationFilter=all',
    'Origin': 'https://app.mahojin.ai',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Cookie': getCookies(),
});

// Cek jumlah poin
const checkPoints = async () => {
    try {
        const response = await axios.get(POINTS_URL, { headers: getHeaders() });
        return response.data.point;
    } catch {
        return 0;
    }
};

// Klaim poin (hanya jika sudah lebih dari 24 jam)
const claimPoints = async () => {
    if (Date.now() - lastClaimTime() < CLAIM_INTERVAL) {
        console.log(chalk.yellow('⏳ Klaim poin belum bisa dilakukan (masih dalam cooldown 24 jam).'));
        return;
    }

    try {
        const response = await axios.post(CLAIM_URL, {}, { headers: getHeaders() });
        console.log(chalk.green(`✅ Claimed Points: ${response.data.claimedPoint}`));
        saveClaimTime();
    } catch {
        console.log(chalk.red('❌ Error claiming points.'));
    }
};

// Ambil prompt acak dari API
const fetchPrompt = async () => {
    try {
        const response = await axios.get(PROMPT_URL);
        const prompts = response.data.prompts;
        return prompts[Math.floor(Math.random() * prompts.length)];
    } catch {
        return 'Default Prompt';
    }
};

// Generate gambar
const generateImage = async () => {
    try {
        const prompt = await fetchPrompt();
        console.log(chalk.blue(`🎨 Using Prompt: ${prompt}`));

        const response = await axios.post(GENERATE_URL, { prompt, aspectRatio: ASPECT_RATIO }, { headers: getHeaders() });
        console.log(chalk.green('🖼️ Image generation requested. ✅ Success'));
    } catch {
        console.log(chalk.red('❌ Error generating image.'));
    }
};

// Loop utama
const main = async () => {
    while (true) {
        let points = await checkPoints();
        console.log(chalk.yellow(`💰 Current Points: ${points}`));

        if (points >= POINT_COST) {
            await generateImage();
        } else {
            console.log(chalk.red('⚠️ Insufficient points.'));
            await claimPoints();
            console.log(chalk.yellow('⏳ Waiting for points to replenish...'));
            await new Promise(r => setTimeout(r, 300000)); // Tunggu 5 menit sebelum cek lagi
        }
    }
};

main();
