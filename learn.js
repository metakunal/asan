//Defining all the variables.
let video;
let poseNet;
let pose;
let skeleton;
let thirtysecs;
let posesArray = ['Mountain', 'Tree', 'Downward Dog', 'Warrior I', 'Warrior II', 'Chair'];
var imgArray = new Array();

var poseImage;

let yogi;
let poseLabel;

var targetLabel;
var errorCounter;
var iterationCounter;
var poseCounter;
var target;

var timeLeft;
//Function for setting up our video and other elements
function setup() {
  var canvas = createCanvas(640, 480);
  canvas.position(130, 210);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  imgArray[0] = new Image();
  imgArray[0].src = 'imgs/mountain.svg';
  imgArray[1] = new Image();
  imgArray[1].src = 'imgs/tree.svg';
  imgArray[2] = new Image();
  imgArray[2].src = 'imgs/dog.svg';
  imgArray[3] = new Image();
  imgArray[3].src = 'imgs/warrior1.svg';
  imgArray[4] = new Image();
  imgArray[4].src = 'imgs/warrior2.svg';
  imgArray[5] = new Image();
  imgArray[5].src = 'imgs/chair.svg';

  poseCounter = 0;
  targetLabel = 1;
  target = posesArray[poseCounter];
  document.getElementById("poseName").textContent = target;
  timeLeft = 10;
  document.getElementById("time").textContent = "00:" + timeLeft;//Timer on the screen
  errorCounter = 0;
  iterationCounter = 0;
  document.getElementById("poseImg").src = imgArray[poseCounter].src;
  //Data for the Neural Network
  let options = {
    inputs: 34,
    outputs: 6,
    task: 'classification',
    debug: true
  }

  yogi = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  yogi.load(modelInfo, yogiLoaded);
}
//Function to tell us that Model is Ready and call classifyPose function
function yogiLoaded() {
  console.log("Model ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    yogi.classify(inputs, gotResult);
  } else {
    console.log("Pose not found");
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  document.getElementById("welldone").textContent = "";
  document.getElementById("sparkles").style.display = "none";
  if (results[0].confidence > 0.70) {
    console.log("Confidence " + results[0].confidence);
    if (results[0].label == targetLabel.toString()) {
      console.log(targetLabel);
      iterationCounter = iterationCounter + 1;

      console.log(iterationCounter)

      if (iterationCounter == 10) {
        console.log("30!")
        iterationCounter = 0;
        nextPose();
      }
      else {
        console.log("doing this")
        timeLeft = timeLeft - 1;
        if (timeLeft < 10) {
          document.getElementById("time").textContent = "00:0" + timeLeft;
        } else {
          document.getElementById("time").textContent = "00:" + timeLeft;
        }
        setTimeout(classifyPose, 1000);
      }
    }
    else {
      errorCounter = errorCounter + 1;
      console.log("error");
      if (errorCounter >= 4) {
        console.log("four errors");
        iterationCounter = 0;
        timeLeft = 10;
        if (timeLeft < 10) {
          document.getElementById("time").textContent = "00:0" + timeLeft;
        } else {
          document.getElementById("time").textContent = "00:" + timeLeft;
        }
        errorCounter = 0;
        setTimeout(classifyPose, 100);
      } else {
        setTimeout(classifyPose, 100);
      }
    }
  }
  else {
    console.log("Doing the pose wrong or not identifying.")
    setTimeout(classifyPose, 100);
  }
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  document.getElementById("rectangle").style.display = "none";
  console.log('poseNet ready');
}
//Function for drawing the skeleton
function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1); //Rotating the video to facilitate the user
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(10);
      stroke(38, 156, 98);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
  pop();
}

function nextPose() {
  if (poseCounter >= 5) {
    console.log("Well done, you have learnt all poses!");
    document.getElementById("finish").textContent = "Amazing!";
    document.getElementById("welldone").textContent = "All poses done.";
    document.getElementById("sparkles").style.display = 'block';
  } else {
    console.log("Well done, you have done all poses!");
    errorCounter = 0;
    iterationCounter = 0;
    poseCounter = poseCounter + 1;
    targetLabel = poseCounter + 1;
    console.log("next pose target label" + targetLabel)
    target = posesArray[poseCounter];
    document.getElementById("poseName").textContent = target;
    document.getElementById("welldone").textContent = "Well done, next pose!";
    document.getElementById("sparkles").style.display = 'block';
    document.getElementById("poseImg").src = imgArray[poseCounter].src;
    console.log("classifying again");
    timeLeft = 10;
    document.getElementById("time").textContent = "00:" + timeLeft;
    setTimeout(classifyPose, 4000)
  }
}
