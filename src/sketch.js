let audio;
let analyzer;
let speechRecognition;

let backgroundColor;
let figureType;

let spectralCrest = 0;
let spectralRolloff = 0;

let spectralSkewness = 0;
let spectralSkewnessMin = 999;
let spectralSkewnessMax = -999;

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
    text("Click to start or pause", width / 2, height / 2);

    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: audio,
        bufferSize: 512,
        featureExtractors: [
            "powerSpectrum",
            "spectralCentroid",
            "spectralRolloff",
            "spectralSkewness",
            "spectralCrest",
            "chroma",
            "perceptualSharpness"
        ],
        callback: (features) => {
            powerSpectrum = features.powerSpectrum;
            spectralCentroid = round(features.spectralCentroid);
            spectralRolloff = features.spectralRolloff;
            spectralSkewness = features.spectralSkewness;
            spectralCrest = features.spectralCrest;
            chroma = features.chroma;
            perceptualSharpness = features.perceptualSharpness;
        }
    });

    speechRecognition = new p5.SpeechRec('en-US', processSpeechInput);
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.onEnd = () => {
        if (audio.isLooping()) {
            speechRecognition.start();
        }
    };
}

function draw() {
    if (!audio.isLooping()) {
        return;
    }

    drawGradientBackground();

    translate(width / 2, height / 2);
    rotateVisualization();

    scaleVisualization();

    drawFigures();
}

function drawGradientBackground() {
    let topColor = backgroundColor;

    if (spectralCentroid < spectralCentroidMin) {
        spectralCentroidMin = spectralCentroid;
    }
    if (spectralCentroid > spectralCentroidMax) {
        spectralCentroidMax = spectralCentroid;
    }
    let bottomColor = color(
        map(spectralCentroid, spectralCentroidMin, spectralCentroidMax, 0, 255),
        (map(spectralCentroid, spectralCentroidMin, spectralCentroidMax, 0, 255) + 85) % 255,
        (map(spectralCentroid, spectralCentroidMin, spectralCentroidMax, 0, 255) + 170) % 255
    );

    for (let x = 0; x <= 2 * width; x++) {
        let lerpAmount = dist(0, 0, x, x) / dist(0, 0, width, height) / 2;
        let currentColor = lerpColor(topColor, bottomColor, lerpAmount);
        stroke(currentColor);
        line(0, x, x, 0);
    }
}

function rotateVisualization() {
    if(spectralSkewness < spectralSkewnessMin) {
        spectralSkewnessMin = spectralSkewness;
    }
    if(spectralSkewness > spectralSkewnessMax) {
        spectralSkewnessMax = spectralSkewness;
    }
    rotate(map(spectralSkewness, spectralSkewnessMin, spectralSkewnessMax, -0.15, 0.15));
}

function scaleVisualization() {
    scale(map(spectralRolloff, 5000, 22050, 0.8, 1.3));
}

function drawFigures() {
    let averagedSpectrumRanges = buildAveragedSpectrumRanges();
    for (let i = 0; i < averagedSpectrumRanges.length; i++) {
        if (averagedSpectrumRanges[i] < averagedSpectrumRangesMin[i]) {
            averagedSpectrumRangesMin[i] = averagedSpectrumRanges[i];
        }
        if (averagedSpectrumRanges[i] > averagedSpectrumRangesMax[i]) {
            averagedSpectrumRangesMax[i] = averagedSpectrumRanges[i];
        }
    }

    sizes = []
    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            if (!sizes[i + 4]) {
                sizes[i + 4] = [];
            }
            let index = max(abs(i), abs(j));
            sizes[i + 4][j + 4] = map(
                averagedSpectrumRanges[index],
                averagedSpectrumRangesMin[index], averagedSpectrumRangesMax[index],
                30, 70
            )
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

            let index = max(abs(i), abs(j));

            let colorRed = map(chroma[index], 0, 1, 0, 255);
            let colorGreen = map(chroma[index + 3], 0, 1, 0, 255);
            let colorBlue = map(chroma[index + 6], 0, 1, 0, 255);

            let maxColorCoef = 255 / max(colorRed, colorGreen, colorBlue);
            colorRed *= maxColorCoef;
            colorGreen *= maxColorCoef;
            colorBlue *= maxColorCoef;

            drawFigure(xDistanceToCenter, yDistanceToCenter, sizes[i + 4][j + 4], color(colorRed, colorGreen, colorBlue));
        }
    }
}

function buildAveragedSpectrumRanges() {
    let n = 5;
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
    return result;
}

function drawFigure(x, y, size, fillColor) {
    noiseSeed(spectralCrest);
    let noiseFactor = map(spectralCrest, 0, 12, 0, size * 0.4);

    stroke(color("blue"));

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
        let detailsLevel = 100;

        let xOffset = size / 2 / detailsLevel;
        let yOffset = size / detailsLevel;
        for (let i = 0; i < detailsLevel; i++) {
            let vertexX = x + xOffset * i;
            let vertexY = y - size / 2 + yOffset * i;
            let xNoiseOffset = noise(i * 0.1) * noiseFactor;
            let yNoiseOffset = noise(i * 0.1) * noiseFactor * 0.5;
            vertex(vertexX + xNoiseOffset, vertexY - yNoiseOffset);
        }

        xOffset = size / detailsLevel;
        for (let i = 1; i < detailsLevel; i++) {
            let vertexX = x + size / 2 - xOffset * i;
            let vertexY = y + size / 2;
            let yNoiseOffset = noise(i * 0.1) * noiseFactor;
            vertex(vertexX, vertexY + yNoiseOffset);
        }

        xOffset = size / 2 / detailsLevel;
        yOffset = size / detailsLevel ;
        for (let i = 1; i < detailsLevel - 1; i++) {
            let vertexX = x - size/2 + xOffset * i;
            let vertexY = y + size / 2 - yOffset * i;
            let xNoiseOffset = noise(i * 0.1) * noiseFactor;
            let yNoiseOffset = noise(i * 0.1) * noiseFactor * 0.5;
            vertex(vertexX - xNoiseOffset, vertexY - yNoiseOffset);
        }
    endShape(CLOSE);
}

function drawCircle(x, y, size, noiseFactor) {
    push();
        translate(x, y);
        beginShape();
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

            let detailsLevel = 70;
            for (let i = 0; i < vertices.length; i++) {
                let startVertex = vertices[i];
                let endVertex = vertices[(i + 1) % vertices.length];

                let edge = p5.Vector.sub(endVertex, startVertex);
                let normal = createVector(-edge.y, edge.x).normalize();

                for (let j = 0; j <= detailsLevel; j++) {
                    let alpha = map(j, 0, detailsLevel, 0, 1);
                    let xOffset = lerp(startVertex.x, endVertex.x, alpha) - normal.x * (noise(j * 0.1) - 0.5) * noiseFactor;
                    let yOffset = lerp(startVertex.y, endVertex.y, alpha) - normal.y * (noise(j * 0.1) - 0.5) * noiseFactor;
                    vertex(xOffset, yOffset);
                }
            }
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

function mouseClicked() {
    userStartAudio();
    if (!audio.isLooping()) {
        audio.loop();
        analyzer.start();
        speechRecognition.start();
    } else {
        speechRecognition.stop();
        analyzer.stop();
        audio.pause();
    }
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