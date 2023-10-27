let audio;
let analyzer;
let speechRecognition;

let backgroundColor;
let figureType;

let spectralCrest = 0;
let rms = 1;

let spectralSkewness = 0;
let spectralSkewnessMin = 999;
let spectralSkewnessMax = -999;

let angle = 0;
let a = 0;
let b = 0;
let powerSpectrum = [];

let spectralCentroid = 0;
let spectralCentroidMin = 999;
let spectralCentroidMax = -999;
let minFreq = 999;
let maxFreq = -999;

let averagedSpectrumRangesMin = [9999, 9999, 9999, 9999, 9999];
let averagedSpectrumRangesMax = [-9999, -9999, -9999, -9999, -9999];

let chroma = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

let perceptualSharpness = 0;
let perceptualSharpnessMin = 999;
let perceptualSharpnessMax = -999;

function preload() {
    audio = loadSound('audio/Kalte_Ohren_(_Remix_).mp3');
}

function setup() {
    createCanvas(800, 800);

    backgroundColor = color("red");
    figureType = "pentagon";

    background("white");
    textAlign(CENTER, CENTER);
    textSize(20);
    fill("black");
    text("Click to start", width / 2, height / 2);

    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: audio,
        bufferSize: 512,
        featureExtractors: ["rms", "spectralSkewness", "spectralCrest", "powerSpectrum", "amplitudeSpectrum", "spectralCentroid", "chroma", "perceptualSharpness"],
        callback: (features) => {
            spectralCrest = features.spectralCrest;
            rms = features.rms;
            spectralSkewness = features.spectralSkewness;
            powerSpectrum = features.amplitudeSpectrum;
            spectralCentroid = round(features.spectralCentroid);
            chroma = features.chroma;
            perceptualSharpness = features.spectralCrest;
        }
    });

    speechRecognition = new p5.SpeechRec('en-US', processSpeechInput);
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    // speechRecognition.onError = () => {
    //     if (audio.isLooping()) {
    //         speechRecognition.stop();
    //         speechRecognition.start();
    //     }
    // }
    speechRecognition.onEnd = () => {
        if (audio.isLooping()) {
            speechRecognition.stop();
            speechRecognition.start();
        }
    };
}

function draw() {
    if (!audio.isLooping()) {
        return;
    }
    //
    background("white");
    // // fill("red")
    // // ellipse()
    //
    // drawPlot();
    // if (a < spectralSkewness) {
    //     a = spectralSkewness;
    // }
    // if (b > spectralSkewness) {
    //     b = spectralSkewness;
    // }
    // console.log(a)
    // console.log(b)

    let topColor = backgroundColor;

    if (spectralCentroid < spectralCentroidMin) {
        spectralCentroidMin = spectralCentroid;
    }
    if (spectralCentroid > spectralCentroidMax) {
        spectralCentroidMax = spectralCentroid;
    }


    let bottomColor = color(map(spectralCentroid, spectralCentroidMin, spectralCentroidMax, 0, 255), (map(spectralCentroid, spectralCentroidMin, spectralCentroidMax, 0, 255) + 85) % 255, (map(spectralCentroid, spectralCentroidMin, spectralCentroidMax, 0, 255) + 170) % 255); // Синий цвет
    // console.log(spectralCentroid + " --- " + minFreq + " --- " + maxFreq); // Синий цвет

    for (let x = 0; x <= 2 * width; x++) {
        let lerpAmount = dist(0, 0, x, x) / dist(0, 0, width, height) / 2;
        let currentColor = lerpColor(topColor, bottomColor, lerpAmount);
        stroke(currentColor);
        line(0, x, x, 0);
    }


    let averagedSpectrumRanges = buildAveragedSpectrumRanges();
    // if (!averagedSpectrumRangesMin) {
    //     averagedSpectrumRangesMin = averagedSpectrumRanges;
    // }
    // if (!averagedSpectrumRangesMax) {
    //     averagedSpectrumRangesMax = averagedSpectrumRanges;
    // }
    for (let i = 0; i < averagedSpectrumRanges.length; i++) {
        if (averagedSpectrumRanges[i] < averagedSpectrumRangesMin[i]) {
            averagedSpectrumRangesMin[i] = averagedSpectrumRanges[i];
        }
        if (averagedSpectrumRanges[i] > averagedSpectrumRangesMax[i]) {
            averagedSpectrumRangesMax[i] = averagedSpectrumRanges[i];
        }
    }

    // console.log(averagedSpectrumRanges)

    if(spectralSkewness < spectralSkewnessMin) {
        spectralSkewnessMin = spectralSkewness;
    }
    if(spectralSkewness > spectralSkewnessMax) {
        spectralSkewnessMax = spectralSkewness;
    }
    angle = map(spectralSkewness, spectralSkewnessMin, spectralSkewnessMax, -0.15, 0.15);
    // angle += spectralSkewness;

    translate(width / 2, height / 2);
    rotate(angle);
    scale(map(rms, 0, 1, 1, 1.5));

    sizes = []
    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            if (!sizes[i + 4]) {
                sizes[i + 4] = [];
            }
            let index = max(abs(i), abs(j));
            // console.log(averagedSpectrumRangesMin[index] + " --- " + averagedSpectrumRangesMax[index])
            sizes[i + 4][j + 4] = map(averagedSpectrumRanges[index], averagedSpectrumRangesMin[index], averagedSpectrumRangesMax[index], 30, 70)
        }
    }

    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            let xDistanceToCenter;
            if (i === 0) {
                xDistanceToCenter = 0;
            } else {
                xDistanceToCenter = sizes[i + 4][j + 4] / 2 + 20 + sizes[4][4] / 2;
                for (let k = i - i/abs(i); abs(k) > 0; k = k - k/abs(k)) {
                    xDistanceToCenter = xDistanceToCenter + sizes[k + 4][j + 4] + 20;
                }
                xDistanceToCenter *= i/abs(i);
            }

            let yDistanceToCenter
            if (j === 0) {
                yDistanceToCenter = 0;
            } else {
                yDistanceToCenter = sizes[i + 4][j + 4] / 2 + 20 + sizes[4][4] / 2;
                for (let k = j - j/abs(j); abs(k) > 0; k = k - k/abs(k)) {
                    yDistanceToCenter = yDistanceToCenter + sizes[i + 4][k + 4] + 20;
                }
                yDistanceToCenter *= j/abs(j);
            }

            // Аккорд 1: C - D♯ - F♯ - A
            // Аккорд 2: D - F - G♯ - B
            // Аккорд 3: E - G - A♯ - C♯
            //
            // C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, B

            let index = max(abs(i), abs(j));

            let colorRed = map(chroma[index], 0, 1, 0, 255);
            let colorGreen = map(chroma[index + 3], 0, 1, 0, 255);
            let colorBlue = map(chroma[index + 6], 0, 1, 0, 255);
            let colorAlpha = map(chroma[index + 7], 0, 1, 200, 255);

            let maxColorCoef = 255 / max(colorRed, colorGreen, colorBlue);
            colorRed *= maxColorCoef;
            colorGreen *= maxColorCoef;
            colorBlue *= maxColorCoef;


            drawFigure(xDistanceToCenter, yDistanceToCenter, sizes[i + 4][j + 4], color(colorRed, colorGreen, colorBlue));
        }

        // console.log(chroma)
    }

    // for (let x = - width / 2 - 160; x < width / 2 + 160; x += 80) {
    //     for (let y = - height / 2- 160; y < height / 2 + 160; y += 80) {
    //         push();
    //         // translate(x, y)
    //         // rotate(-angle);
    //         // translate(-75, -75)
    //         // drawSquare(x, y, 50);
    //         pop();
    //     }
    // }

}

function processSpeechInput() {
    console.log(speechRecognition.resultString)
    let recognizedText = speechRecognition.resultString.toLowerCase();
    if (recognizedText.includes("black")) {
        backgroundColor = color("black");
        return;
    }
    if (recognizedText.includes("white")) {
        backgroundColor = color("white");
        return;
    }
    if (recognizedText.includes("red")) {
        backgroundColor = color("red");
        return;
    }
    if (recognizedText.includes("blue")) {
        backgroundColor = color("blue");
        return;
    }
    if (recognizedText.includes("green")) {
        backgroundColor = color("green");
        return;
    }
    if (recognizedText.includes("square")) {
        figureType = "square";
        return;
    }
    if (recognizedText.includes("triangle")) {
        figureType = "triangle";
        return;
    }
    if (recognizedText.includes("circle")) {
        figureType = "circle";
        return;
    }
    if (recognizedText.includes("pentagon")) {
        figureType = "pentagon";
        return;
    }
}

function buildAveragedSpectrumRanges() {
    let n = 5;
    // console.log(spectralCentroid)
    let minIndex = max(min(spectralCentroid - 30, minFreq), 0);
    let maxIndex = min(max(spectralCentroid + 30, maxFreq), 255);
    if (minIndex < minFreq) {
        minFreq = minIndex;
    }
    if (maxIndex > maxFreq) {
        maxFreq = maxIndex;
    }
    let targetPowerSpectrum = powerSpectrum.slice(minIndex, maxIndex + 1);

    let result = []
    for(let i = 0; i < n; i++) {
        result.push(avg(targetPowerSpectrum.slice(i * targetPowerSpectrum.length / 5, (i + 1) * targetPowerSpectrum.length / 5)))
    }

    // result[0] *= 0.0001;
    // result[1] *= 2;
    // result[2] *= 3;
    // result[3] *= 4;
    // result[4] *= 5;

    return result;
}

function mouseClicked() {
    userStartAudio();
    if (!audio.isLooping()) {
        audio.loop();
        analyzer.start();
        speechRecognition.start();
    } else {

    }
}

function drawFigure(x, y, size, fillColor) {
    noiseSeed(spectralCrest); // Задайте начальное значение для шума
    let noiseFactor = map(spectralCrest, 0, 12, 0, size * 0.4); // Максимальное отклонение по оси Y

    stroke(color("blue"));
    // noStroke();


    if (perceptualSharpness < perceptualSharpnessMin) {
        perceptualSharpnessMin = perceptualSharpness;
    }
    if (perceptualSharpness > perceptualSharpnessMax) {
        perceptualSharpnessMax = perceptualSharpness;
    }
    strokeWeight(map(perceptualSharpness, perceptualSharpnessMin, perceptualSharpnessMax, 0, 3));


    fill(fillColor);

    switch (figureType) {
        case "square":
            drawSquare(x, y, size, noiseFactor);
            break;
        case "triangle":
            drawTriangle(x, y, size, noiseFactor);
            break;
        case "circle":
            drawCircle(x, y, size, noiseFactor);
            break;
        case "pentagon":
            drawPentagon(x, y, size, noiseFactor);
            break;
    }
}

// function drawPlot() {
//     let startX = 20;
//     let barWidth = (width - 40) / (sound.frames() / 512);
//     let startY = 500;
//
//     for(let i = 1; i < featureValues.length-1 ; i++) {
//         // let height = map(featureValues[i], 0, featureMax, 0, 300);
//         let height = 0;
//         // if (abs(featureValues[i].zcr - avg(featureValues.slice(i - 5, i))) > 15
//         //     && featureValues[i].spectralKurtosis > 0.3
//         //     // && featureValues[i].spectralSpread < 150
//         // ) {
//             // height = map(featureValues[i] - featureValues[i-1], -50, 0, 20, 300);
//         if (featureValues[i].spectralCrest > featureValues[i-1].spectralCrest && featureValues[i].spectralCrest > featureValues[i+1].spectralCrest) {
//             height = map(featureValues[i].spectralCrest, 0, 30, 0, 400);
//         }
//             // console.log(featureValues[i].spectralCrest);
//         // }
//         fill(color("red"));
//         noStroke();
//         // rect(startX + i * barWidth, startY - height, barWidth, height);
//         rect(startX + i * barWidth, startY - height, barWidth, height);
//     }
// }

function drawSquare(x, y, size, noiseFactor) {
    push();
    translate(- size / 2, - size / 2);


    beginShape();

    for (let i = x; i <= x + size; i++) {
        let yOffset = noise(i * 0.1) * noiseFactor;
        vertex(i, y - yOffset);
    }

    for (let i = y ; i <= y + size; i++) {
        let xOffset = noise(i * 0.1) * noiseFactor;
        vertex(x + size + xOffset, i);
    }

    for (let i = x + size; i >= x; i--) {
        let yOffset = noise(i * 0.1) * noiseFactor;
        vertex(i, y + size + yOffset);
    }

    for (let i = y + size; i >= y; i--) {
        let xOffset = noise(i * 0.1) * noiseFactor;
        vertex(x - xOffset, i);
    }

    endShape(CLOSE);

    pop();
}

function drawTriangle(x, y, size, noiseFactor) {

    beginShape();
    let n = 100;

    let xOffset = size / 2 / n;
    let yOffset = size / n;
    for (let i = 0; i < n; i++) {
        let vertexX = x + xOffset * i;
        let vertexY = y - size / 2 + yOffset * i;
        let xNoiseOffset = noise(i * 0.1) * noiseFactor;
        let yNoiseOffset = noise(i * 0.1) * noiseFactor * 0.5;
        vertex(vertexX + xNoiseOffset, vertexY - yNoiseOffset);
        // vertex(vertexX, vertexY);
    }

    xOffset = size / n;
    for (let i = 1; i < n; i++) {
        let vertexX = x + size / 2 - xOffset * i;
        let vertexY = y + size / 2;
        let yNoiseOffset = noise(i * 0.1) * noiseFactor;
        vertex(vertexX, vertexY + yNoiseOffset);
    }

    xOffset = size / 2 / n;
    yOffset = size / n ;
    for (let i = 1; i < n - 1; i++) {
        let vertexX = x - size/2 + xOffset * i;
        let vertexY = y + size / 2 - yOffset * i;
        let xNoiseOffset = noise(i * 0.1) * noiseFactor;
        let yNoiseOffset = noise(i * 0.1) * noiseFactor * 0.5;
        vertex(vertexX - xNoiseOffset, vertexY - yNoiseOffset);
    }

    endShape(CLOSE);
}

function drawCircle(x, y, size, noiseFactor) {


    // translate(-x);





    push();
        translate(x, y);
        beginShape();

        // rotate(PI / 2);
        // rect(x, y, 100, 50)

        for(let angle = 0; angle < TWO_PI; angle += 0.02) {
            let noiseOffset = noise(angle * 10) * noiseFactor
            let xOffset = (size / 2 + noiseOffset) * cos(angle);
            let yOffset = (size / 2 + noiseOffset) * sin(angle);
            vertex(xOffset, yOffset);
        }
        endShape(CLOSE);
    pop();





}
function drawPentagon(x, y, size, noiseFactor) {
    push();
    translate(x, y);
    beginShape();


    let vertices = [];
    for(let angle = - HALF_PI; angle < TWO_PI - HALF_PI; angle += TWO_PI / 5) {
        let xOffset = (size / 2) * cos(angle);
        let yOffset = (size / 2) * sin(angle);
        vertices.push(createVector(xOffset, yOffset));
    }

    let n = 70;

    for (let i = 0; i < vertices.length; i++) {
        let startVertex = vertices[i];
        let endVertex = vertices[(i + 1) % vertices.length];

        let edge = p5.Vector.sub(endVertex, startVertex);
        let normal = createVector(-edge.y, edge.x).normalize();

        for (let j = 0; j <= n; j++) {
            let alpha = map(j, 0, n, 0, 1);
            let xOffset = lerp(startVertex.x, endVertex.x, alpha) - normal.x * (noise(j * 0.1) - 0.5) * noiseFactor;
            let yOffset = lerp(startVertex.y, endVertex.y, alpha) - normal.y * (noise(j * 0.1) - 0.5) * noiseFactor;
            vertex(xOffset, yOffset);
        }
    }

    // let noiseOffset = noise(angle * 10) * noiseFactor
    endShape(CLOSE);
    pop();
}


function avg(array) {
    if (array.length === 0) {
        return 0;
    }

    let sum = 0;
    for(let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

function parseResult()
{
    // recognition system will often append words into phrases.
    // so hack here is to only use the last word:
    var mostrecentword = myRec.resultString.split(' ').pop();
    if(mostrecentword.indexOf("left")!==-1) { dx=-1;dy=0; }
    else if(mostrecentword.indexOf("right")!==-1) { dx=1;dy=0; }
    else if(mostrecentword.indexOf("up")!==-1) { dx=0;dy=-1; }
    else if(mostrecentword.indexOf("down")!==-1) { dx=0;dy=1; }
    else if(mostrecentword.indexOf("clear")!==-1) { background(255); }
    console.log(mostrecentword);
}