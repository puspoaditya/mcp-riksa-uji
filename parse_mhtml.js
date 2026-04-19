const fs = require('fs');

const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');

// Decode quoted-printable
content = content.replace(/=\r?\n/g, '');
content = content.replace(/=([A-F0-9]{2})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
});

// Now that it's decoded, let's find the question text.
// Usually google form questions are in <span dir="auto" class="M7eMe">...</span> or <div role="heading"...
let questions = [];
const matches = content.matchAll(/class="M7eMe"[^>]*>([^<]+)<\/span>/g);
for (const match of matches) {
    if (!questions.includes(match[1])) {
        questions.push(match[1]);
    }
}

if (questions.length === 0) {
    // try another regex for Google Forms
    const m2 = content.matchAll(/<div role="heading" [^>]*>.*?<span dir="auto"[^>]*>([^<]+)<\/span>/gs);
    for (const match of m2) {
        if (!questions.includes(match[1])) {
            questions.push(match[1]);
        }
    }
}

if (questions.length === 0) {
    // try aria-label
    const m3 = content.matchAll(/aria-label="([^"]+)"/g);
    for (const match of m3) {
        if (!questions.includes(match[1])) {
            questions.push(match[1]);
        }
    }
}

console.log(questions.join('\n'));
