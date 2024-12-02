import fs from 'fs';
import path from 'path';

const calculator_folder = './cropped_faces_calculator';
const compreface_folder = './cropped_faces_compreface';

function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

async function processFiles() {
    const embedding_calculator = fs.readdirSync(calculator_folder).filter(file => file.endsWith('.json'));
    const embedding_compreface = fs.readdirSync(compreface_folder).filter(file => file.endsWith('.json'));

    if (embedding_calculator.length !== embedding_compreface.length) {
        console.error('As pastas não contêm o mesmo número de arquivos.');
        return;
    }

    for (let i = 0; i < embedding_calculator.length; i++) {
        const file1 = path.join(calculator_folder, embedding_calculator[i]);
        const file2 = path.join(compreface_folder, embedding_compreface[i]);

        try {
            const face1 = readJsonFile(file1);
            const face2 = readJsonFile(file2);

            const dist = getEuclideanDistance(face1, face2);
            const coeffs = [1.224676, 6.322647217];
            const result = (Math.tanh((coeffs[0] - dist) * coeffs[1]) + 1) / 2;

            console.log(`Resultado para ${embedding_calculator[i]} e ${embedding_compreface[i]}: ${result}`);
        } catch (err) {
            console.error(`Erro ao processar os arquivos ${embedding_calculator[i]} e ${embedding_compreface[i]}:`, err.message);
        }
    }
}

function normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value ** 2, 0));
    return vector.map(value => value / magnitude);
}

function getEuclideanDistance(v1, v2) {
    const normalizedV1 = normalizeVector(v1);
    const normalizedV2 = normalizeVector(v2);

    return Math.sqrt(
        normalizedV1.reduce((sum, value, index) => sum + (value - normalizedV2[index]) ** 2, 0)
    );
}

processFiles();
