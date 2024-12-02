import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const url = "http://localhost:8000/api/v1/recognition/recognize?detect_faces=true&face_plugins=landmarks,calculator";
const key = '5aa01f8d-72cf-46b6-aeae-63b1b3c31f77'

const sampleImages = "./cropped_faces_compreface";

const imagePaths = fs.readdirSync(sampleImages)
    .map(file => path.join(sampleImages, file))
    .filter(file => fs.statSync(file).isFile());

console.log(imagePaths);

const images = imagePaths.map(imagePath => {
    return {
        name: path.basename(imagePath),
        data: fs.readFileSync(imagePath)
    };
});

let iterationCount = 0;

async function sendImage(imageName, imageData) {
    const formData = new FormData();
    
    formData.append('file', Buffer.from(imageData), { filename: imageName, contentType: 'image/jpeg' });

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                ...formData.getHeaders(),
                'x-api-key': key
            }
        });

        const responseData = await response.json()
        const result = responseData.result
        const embedding = result[0].embedding

        saveEmbeddingToFile(imageName, embedding)
    } catch (e) {
        console.log(`Erro ao enviar a imagem ${imageName}: ${e.message}`);
    }
}

async function saveEmbeddingToFile(imageName, embedding) {
    const outputDir = './cropped_faces_compreface';
    const outputFile = path.join(outputDir, `${path.basename(imageName, path.extname(imageName))}.json`);

    fs.writeFileSync(outputFile, JSON.stringify(embedding, null, 2), 'utf-8');
    console.log(`Embedding salvo em: ${outputFile}`);
}

async function runTests() {
    while (iterationCount < images.length) {
        for (const { name, data } of images) {
            iterationCount++;
            await sendImage(name, data);
        }
    }
}

runTests();
