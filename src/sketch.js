let sound;
let analyzer;

function preload() {
    sound = loadSound('audio/Kalte_Ohren_(_Remix_).mp3');
}

function setup() {
    createCanvas(800, 600);

    background("white");
    textAlign(CENTER, CENTER);
    textSize(20);
    fill("black");
    text("Click to start", width / 2, height / 2);

    analyzer = Meyda.createMeydaAnalyzer({
        audioContext: getAudioContext(),
        source: sound,
        bufferSize: 512,
        featureExtractors: ["rms"],
        callback: (features) => {
            console.log(features);
        }
    });
}

function draw() {
    if (!sound.isLooping()) {
        return;
    }

    background("black");
    fill("red")
    ellipse()
}

function mouseClicked() {
    userStartAudio();
    if (!sound.isLooping()) {
        sound.loop();
        analyzer.start();
    }
}