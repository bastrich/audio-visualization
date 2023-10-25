let sound;
let analyzer;

let featureValues = []
let featureMax = 1

let spectralCrest = 0;
let rms = 1;
let spectralSkewness = 0;
let angle = 0;
let a = 0;
let b = 0;
let powerSpectrum = [];

function preload() {
    sound = loadSound('audio/Kalte_Ohren_(_Remix_).mp3');
}

function setup() {
    createCanvas(700, 700);
    // createCanvas(2000, 2000);

    background("white");
    textAlign(CENTER, CENTER);
    textSize(20);
    fill("black");
    text("Click to start", width / 2, height / 2);

    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: sound,
        bufferSize: 512,
        featureExtractors: ["rms", "spectralSkewness", "spectralCrest", "powerSpectrum"],
        callback: (features) => {
            // console.log(features);
            featureValues.push(features);
            spectralCrest = features.spectralCrest;
            rms = features.rms;
            spectralSkewness = features.spectralSkewness;
            powerSpectrum = features.powerSpectrum;
        }
    });
}

function draw() {
    if (!sound.isLooping()) {
        return;
    }
    //
    background("White");
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


    let averagedSpectrumRanges = buildAveragedSpectrumRanges();
    console.log(averagedSpectrumRanges)

    angle += map(spectralSkewness, -0.05, 15, -0.15, 1) * 0.1;

    translate(width / 2, height / 2);
    // rotate(angle);
    scale(map(rms, 0, 1, 1, 1.5));

    sizes = []
    for (let i = -4; i <= 4; i++) {
        for (let j = -4; j <= 4; j++) {
            if (!sizes[i + 4]) {
                sizes[i + 4] = [];
            }
            sizes[i + 4][j + 4] = map(averagedSpectrumRanges[max(abs(i), abs(j))], 0, 1, 40, 100)
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

            drawSquare(xDistanceToCenter, yDistanceToCenter, sizes[i + 4][j + 4]);
        }
    }

    for (let x = - width / 2 - 160; x < width / 2 + 160; x += 80) {
        for (let y = - height / 2- 160; y < height / 2 + 160; y += 80) {
            push();
            // translate(x, y)
            // rotate(-angle);
            // translate(-75, -75)
            // drawSquare(x, y, 50);
            pop();
        }
    }

}

function buildAveragedSpectrumRanges() {
    let n = 5;
    let minIndex = 1;
    let maxIndex = 300;
    let targetPowerSpectrum = powerSpectrum.slice(minIndex, maxIndex + 1);

    let result = []
    for(let i = 0; i < n; i++) {
        result.push(avg(targetPowerSpectrum.slice(i * targetPowerSpectrum.length / 5, (i + 1) * targetPowerSpectrum.length / 5)))
    }

    result[0] *= 0.0001;
    // result[1] *= 2;
    // result[2] *= 3;
    // result[3] *= 4;
    // result[4] *= 5;

    return result;
}

function mouseClicked() {
    userStartAudio();
    if (!sound.isLooping()) {
        sound.loop();
        analyzer.start();
    }
}

function drawSquare(x, y, size) {
    noiseSeed(spectralCrest); // Задайте начальное значение для шума
    let noiseFactor = map(spectralCrest, 0, 30, 0, size); // Максимальное отклонение по оси Y

    push();
    translate(- size / 2, - size / 2);

    // stroke(color("blue"));
    noStroke();
    fill(color("DeepPink"));
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


function avg(array) {
    let sum = 0;
    for(let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}