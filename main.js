const XBox = [
    4, 10, 9, 2, 13, 8, 0, 14, 6, 11, 1, 12, 7, 15, 5, 3,
    14, 11, 4, 12, 6, 13, 15, 10, 2, 3, 8, 1, 0, 7, 5, 9,
    5, 8, 1, 13, 10, 3, 4, 2, 14, 15, 12, 7, 6, 0, 9, 11,
    7, 13, 10, 1, 0, 8, 9, 15, 14, 4, 6, 12, 11, 2, 5, 3,
    6, 12, 7, 1, 5, 15, 13, 8, 4, 10, 9, 14, 0, 3, 11, 2,
    4, 11, 10, 0, 7, 2, 1, 13, 3, 6, 8, 5, 9, 12, 15, 14,
    13, 11, 4, 1, 3, 15, 5, 9, 0, 10, 14, 7, 6, 8, 2, 12,
    1, 15, 13, 0, 5, 7, 10, 4, 9, 2, 3, 14, 6, 11, 8, 12
];

//Преобразование строки в 32-битное число 
function RoundOfEncryption32(str) {
    let part32 = 0;
    for (let i = 0; i < str.length; i++) {
        part32 += str.charCodeAt(i) << (8 * i);
    }
    return part32;
}

//Преобразование 32-битного числа в строку
function Part32InLine(part32) {
    let str = '';
    for (let i = 0; i < 4; i++) {
        str += String.fromCharCode((part32 >> (8 * i)) & 0xFF);
    }
    return str;
}

//Генерация подключей
function GenerateAdditionalKeys(key) {
    let addkeys = [];
    for (let i = 0; i < 8; i++) {
        addkeys.push(parseInt(key.slice(i * 8, (i + 1) * 8), 16));
    }
    return addkeys;
}

// Функция F с использованием блоков
function F(R) {
    let result = 0;
    for (let i = 0; i < 8; i++) {
        let byte = (R >> (4 * i)) & 0xF;
        let xBoxValue = XBox[(i * 16) + byte];
        result |= xBoxValue << (4 * i);
    }
    return result;
}

//Сдвиг влево на 11 бит
function leftShift11(R) {
    return ((R << 11) | (R >>> (32 - 11))) >>> 0;
}

//Шифрование блока
function encryptBlock(block, key) {
    let addkeys = GenerateAdditionalKeys(key);
    let L = RoundOfEncryption32(block.slice(0, 4));
    let R = RoundOfEncryption32(block.slice(4, 8));

    console.log(`Исходный блок: L = ${L.toString(16)}, R = ${R.toString(16)}`);

    for (let i = 1; i <= 32; i++) {
        let V = R;
        let j = (i < 25) ? (i - 1) % 8 : (32 - i) % 8;
        R = (R + addkeys[j]) % Math.pow(2, 32);
        R = F(R);
        R = leftShift11(R);
        R = R ^ L;
        L = V;

        console.log(`Раунд ${i}: L = ${L.toString(16)}, R = ${R.toString(16)}`);
    }

    return Part32InLine(L) + Part32InLine(R);
}

//Дешифрования блока
function decryptBlock(block, key) {
    let addkeys = GenerateAdditionalKeys(key);
    let L = RoundOfEncryption32(block.slice(0, 4));
    let R = RoundOfEncryption32(block.slice(4, 8));

    console.log(`Исходный блок: L = ${L.toString(16)}, R = ${R.toString(16)}`);

    for (let i = 1; i <= 32; i++) {
        let V = L;
        let j = (i <= 8) ? (i - 1) % 8 : (32 - i) % 8;
        L = (L + addkeys[j]) % Math.pow(2, 32);
        L = F(L);
        L = leftShift11(L);
        L = L ^ R;
        R = V;

        console.log(`Раунд ${i}: L = ${L.toString(16)}, R = ${R.toString(16)}`);
    }

    return Part32InLine(L) + Part32InLine(R);
}

//Дополнения текста до 8 байт
function enteredText(text) {
    let addingLength = 8 - (text.length % 8);
    if (addingLength === 8) return text;
    let adding = String.fromCharCode(addingLength).repeat(addingLength);
    console.log(`Дополнение текста: ${adding}`);
    return text + adding;
}

//Удаление дополнения
function deletingText(text) {
    let addingLength = text.charCodeAt(text.length - 1);
    console.log(`Удаление дополнения: ${addingLength} байт`);
    return text.slice(0, text.length - addingLength);
}

//Шифрование текста
function encryptText(text, key) {
    if (key.length !== 32) {
        alert('Длина ключа должна быть 32 символа в 16-ричной системе');
        return '';
    }

    let encryptedText = '';
    let entText = enteredText(text); // Дополняем текст до 8 байт

    for (let i = 0; i < entText.length; i += 8) {
        let block = entText.slice(i, i + 8);
        let encryptedBlock = encryptBlock(block, key);
        encryptedText += encryptedBlock;
    }

    return encryptedText;
}

//Дешифрование текста
function decryptText(encryptedText, key) {
    if (key.length !== 32) {
        alert('Длина ключа должна быть 32 символа в 16-ричной системе');
        return '';
    }

    let decryptedText = '';

    for (let i = 0; i < encryptedText.length; i += 8) {
        let block = encryptedText.slice(i, i + 8);
        let decryptedBlock = decryptBlock(block, key);
        decryptedText += decryptedBlock;
    }

    return deletingText(decryptedText);
}

document.getElementById('encryptButton').addEventListener('click', function () {
    let text = document.getElementById('text').value;
    let key = document.getElementById('key').value;
    let encrypted = encryptText(text, key);
    document.getElementById('result').value = encrypted;
});

document.getElementById('decryptButton').addEventListener('click', function () {
    let text = document.getElementById('text').value;
    let key = document.getElementById('key').value;
    let decrypted = decryptText(text, key);
    document.getElementById('result').value = decrypted;
});
