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

function preload() {
    sound = loadSound('audio/Kalte_Ohren_(_Remix_).mp3');
}

function setup() {
    createCanvas(700, 700);

    background("white");
    textAlign(CENTER, CENTER);
    textSize(20);
    fill("black");
    text("Click to start", width / 2, height / 2);

    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: sound,
        bufferSize: 512,
        featureExtractors: ["rms", "spectralSkewness", "spectralCrest"],
        callback: (features) => {
            // console.log(features);
            featureValues.push(features);
            spectralCrest = features.spectralCrest;
            rms = features.rms;
            spectralSkewness = features.spectralSkewness;
        }
    });
}

function draw() {
    if (!sound.isLooping()) {
        return;
    }
    //
    background("Lime");
    // // fill("red")
    // // ellipse()
    //
    // drawPlot();
    if (a < spectralSkewness) {
        a = spectralSkewness;
    }
    if (b > spectralSkewness) {
        b = spectralSkewness;
    }
    console.log(a)
    console.log(b)

    angle += map(spectralSkewness, -0.05, 15, -0.15, 1) * 0.1;

    translate(width / 2, height / 2);
    rotate(angle);
    scale(map(rms, 0, 1, 1, 1.5));
    for (let x = - width / 2 - 160; x < width / 2 + 160; x += 80) {
        for (let y = - height / 2- 160; y < height / 2 + 160; y += 80) {
            push();
            // translate(x, y)
            // rotate(-angle);
            // translate(-75, -75)
            drawSquare(x, y);
            pop();
        }
    }

}

function mouseClicked() {
    userStartAudio();
    if (!sound.isLooping()) {
        sound.loop();
        analyzer.start();
    }
}

function drawSquare(x, y) {
    let w = 50; // Ширина и высота прямоугольника
    let h = 50;

    noiseSeed(spectralCrest); // Задайте начальное значение для шума
    let noiseFactor = map(spectralCrest, 0, 30, 0, 50); // Максимальное отклонение по оси Y


    stroke(color("blue"));
    fill(color("DeepPink"));
    beginShape();


    let startX;
    let startY;
    let lastX;
    let lastY;

    for (let i = x; i <= x + w; i++) {
        let yOffset = noise(i * 0.1) * noiseFactor;
        vertex(i, y - yOffset);
    }

    for (let i = y ; i <= y + h; i++) {
        let xOffset = noise(i * 0.1) * noiseFactor;
        vertex(x + w + xOffset, i);
    }

    for (let i = x + w; i >= x; i--) {
        let yOffset = noise(i * 0.1) * noiseFactor;
        vertex(i, y + h + yOffset);
    }

    for (let i = y + h; i >= y; i--) {
        let xOffset = noise(i * 0.1) * noiseFactor;
        vertex(x - xOffset, i);
    }

    endShape(CLOSE);
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
        sum += array[i].zcr;
    }
    return sum / array.length;
}