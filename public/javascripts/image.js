import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  renderImageToCanvas,
  toggleInstructor,
} from "./util.js";

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75; // lower for mobile
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

/**
 * Mobilenet Model
 * Faster, less accurate pose estimation library
 */
const model = {
  algorithm: "multi-pose",
  input: {
    architecture: "MobileNetV1",
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes,
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0,
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showKeypoint: true,
    showBoundingBox: false,
  },
  net: null,
};

/**
 * ResNet Model
 * Not in use but if wanting a more accurate model then we recommend ResNet
 */
// const model = {
//   algorithm: 'multi-pose',
//   input: {
//     architecture: 'ResNet50',
//     outputStride: defaultResNetStride,
//     inputResolution: defaultResNetInputResolution,
//     multiplier: defaultResNetMultiplier,
//     quantBytes: defaultQuantBytes
//   },
//   singlePoseDetection: {
//     minPoseConfidence: 0.1,
//     minPartConfidence: 0.5,
//   },
//   multiPoseDetection: {
//     maxPoseDetections: 5,
//     minPoseConfidence: 0.15,
//     minPartConfidence: 0.1,
//     nmsRadius: 30.0,
//   },
//   output: {
//     showVideo: true,
//     showSkeleton: true,
//     showKeypoint: true,
//     showBoundingBox: false,
//   },
//   net: null,
// };

//
const imageElement = document.getElementById("image");

/**
 * 
 */
posenet
  .load({
    architecture: model.input.architecture,
    outputStride: model.input.outputStride,
    inputResolution: model.input.inputResolution,
    multiplier: model.input.multiplier,
    quantBytes: model.input.quantBytes,
  })
  .then(function (net) {
    const poses = net.estimateMultiplePoses(imageElement, {
      flipHorizontal: false,
      maxDetections: model.multiPoseDetection.maxPoseDetections,
      scoreThreshold: model.multiPoseDetection.minPartConfidence,
      nmsRadius: model.multiPoseDetection.nmsRadius,
    });
    return poses;
  })
  .then(function (poses) {
    console.log(poses);

    const canvas = document.getElementById("outputImg");

    renderImageToCanvas(
      imageElement,
      [imageElement.width, imageElement.height],
      canvas
    );

    /* Function used to draw an instructor     
       NOTE: This function is commented out in order to not draw the instructor model on the image
    toggleInstructor(true);
    drawResults(
      canvas,
      instructor,
      model.multiPoseDetection.minPartConfidence,
      model.multiPoseDetection.minPoseConfidence
    ); */

    // draw student
    toggleInstructor(false);
    drawResults(
      canvas,
      poses,
      model.multiPoseDetection.minPartConfidence,
      model.multiPoseDetection.minPoseConfidence
    );
  });

/**
 * 
 * @param {*} canvas 
 * @param {*} poses 
 * @param {*} minPartConfidence 
 * @param {*} minPoseConfidence 
 */
function drawResults(canvas, poses, minPartConfidence, minPoseConfidence) {
  const ctx = canvas.getContext("2d");
  poses.forEach((pose) => {
    if (pose.score >= minPoseConfidence) {
      if (model.output.showKeypoint) {
        drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      }

      if (model.output.showSkeleton) {
        // TODO: fix
        drawSkeleton(null, pose.keypoints, minPartConfidence, ctx);
      }

      if (model.output.showBoundingBox) {
        drawBoundingBox(pose.keypoints, ctx);
      }
    }
  });
}
