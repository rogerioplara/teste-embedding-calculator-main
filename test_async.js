import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const url = "http://127.0.0.1:3393/find_faces";
const sampleImages = "./sample_images";

const croppedFacesDir = "./cropped_faces_compreface_old"

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
    
    formData.append('image', Buffer.from(imageData), { filename: imageName, contentType: 'image/jpeg' });

    try {
        const startTime = Date.now();

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });

        const responseData = await response.json();
        const result = responseData.faces || [];
        const numObjects = result.length;

        const elapsedTime = Date.now() - startTime;

        // console.log(`Img: ${imageName}\nStatus Code: ${response.status}, Tempo decorrido: ${elapsedTime}ms Iteration: ${iterationCount} | Subjects: ${numObjects}`);

        // console.log('Resposta completa do servidor:', JSON.stringify(responseData, null, 2));

        result.forEach((face, index) => {
            const base64Data = face.face_img_base64;

            // Decodificar o Base64 e salvar o arquivo como JPEG
            const filePath = path.join(croppedFacesDir, `${imageName}_face_${index + 1}.jpeg`);
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(filePath, buffer);

            console.log(`Face ${index + 1} salva em: ${filePath}`);
        });

    } catch (e) {
        console.log(`Erro ao enviar a imagem ${imageName}: ${e.message}`);
    }
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
