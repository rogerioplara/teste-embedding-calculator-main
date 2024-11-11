const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Continue usando require
const FormData = require('form-data');

const url = "http://localhost:3393/find_faces";
const sampleImages = "./sample_images";

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
        const response = await fetch(`${url}`, {
            method: 'POST',
            body: formData
        });

        const responseData = await response.json();
        const result = responseData.faces || [];
        const numObjects = result.length;
        

        const elapsedTime = Date.now() - startTime;

        console.log(`Img: ${imageName}\nStatus Code: ${response.status}, Tempo decorrido: ${elapsedTime}ms Iteration: ${iterationCount} | Subjects: ${numObjects}`);

        // responseData.faces.forEach(face => {
        //     const { age, detection, face_points, is_male, pose } = face;
        //     const { bbox, det_score } = detection;
        //     const { pitch, yaw, roll } = pose;

        //     // Exibindo as informações no console
        //     console.log(`Img: ${imageName}, Status Code: ${response.status}`);
        //     console.log(`Idade: ${age}`);
        //     console.log(`Detecção: ${JSON.stringify(bbox)} (Score: ${det_score})`);
        //     console.log(`Pontos Faciais: ${JSON.stringify(face_points)}`);
        //     console.log(`Gênero: ${is_male === 1 ? 'Masculino' : 'Feminino'}`);
        //     console.log(`Pose (Pitch: ${pitch}, Yaw: ${yaw}, Roll: ${roll})`);
        //     console.log('-------------------------------------------');
        // });

        // console.log('Resposta completa do servidor:', JSON.stringify(responseData, null, 2));
        
    } catch (e) {
        console.log(`Erro ao enviar a imagem ${imageName}: ${e.message}`);
    }
}


async function runTests() {
    while (true) {
        for (const { name, data } of images) {
            iterationCount++;
            await sendImage(name, data);
        }
    }
}

runTests();