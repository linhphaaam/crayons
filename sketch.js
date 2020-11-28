// a shader variable

let theShader;
let capture;
let rock_img;
let line_img;
let face_img;
let contour_img;
let text_img;
let speechRec;
let lang;
let p;
let fontsize = 32;
let speech_history = [];
var w = 1024;
var h = 800;

function preload(){
  // load the shader
  theShader = loadShader('shader.vert', 'shader.frag');
  rock_img = loadImage('assets/rock.jpg');
  line_img = loadImage('assets/frida_1.jpg');
}

function setup() {
  // disables scaling for retina screens which can create inconsistent scaling between displays
  pixelDensity(1);
  
  // shaders require WEBGL mode to work
  createCanvas(w, h, WEBGL);
  noStroke();
  lang = navigator.language || 'en-US';
  speechRec = new p5.SpeechRec(lang, gotSpeech);
  let continuous = true;
  let interim = false;
  speechRec.start(continuous, interim);

  capture = createCapture(VIDEO);
  capture.size(w, h);
  contour_img = createGraphics(capture.width, capture.height);
  contour_img.textSize(fontsize);
  p = createP('waiting');
  face_img = capture.get(0, 0, capture.width, capture.height); 
  text_img = createGraphics(w, h);
  
  
  // cam.hide();
}

function gotSpeech() {
  p.html(speechRec.resultString);
  console.log(speechRec.resultString);
  speech_history.push(speechRec.resultString);
  contour_img.text(speechRec.resultString, random(w), random(h));

}

var captureMat, gray, blurred, thresholded;
var contours, hierarchy, color_scalar;

function cvSetup() {
  captureMat = new cv.Mat([h, w], cv.CV_8UC4);
  gray = new cv.Mat([h, w], cv.CV_8UC1);
  blurred = new cv.Mat([h, w], cv.CV_8UC1);
  thresholded = new cv.Mat([h, w], cv.CV_8UC1);
  
}

var ready = false;

function cvReady() {
  if(!cv || !cv.loaded) return false;
  if(ready) return true;
  cvSetup();
  ready = true;
  return true;
}


function draw() {  
  contour_img.background(224,220,217);

  var showThresholded = select('#showThresholded').checked();
  
  if (cvReady()) {
    capture.loadPixels();  
    if (pixels.length > 0) {
      // console.log('test'); 
  
    // for (let x = 0; x < capture.width; x++) {
    //   for (let y = 0; y < capture.height; y++) {
    //     let i = (x + y * capture.width) * 4;
    //     let r = pixels[i+0];
    //     let g = pixels[i+1];
    //     let b = pixels[i+2];
    //     let a = pixels[i+3];
        
    //     let pixelColor;
    //     // console.log(g);
    //     if ((g / 255) > 0.5) {
    //       pixelColor = 255;
    //     } else {

    //       pixelColor = 0;
    //     }
        
    //     pixels[i+0] = pixelColor;
    //     pixels[i+1] = pixelColor;
    //     pixels[i+2] = pixelColor;
    //   }
    // }
    // capture.updatePixels(); 
      captureMat.data().set(pixels);

      var blurRadius = select('#blurRadius').value();
      blurRadius = map(blurRadius, 0, 100, 1, 10);

      var threshold = select('#threshold').value();
      threshold = map(threshold, 0, 100, 0, 255);

      cv.cvtColor(captureMat, gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
      cv.blur(gray, blurred, [blurRadius, blurRadius], [-1, -1], cv.BORDER_DEFAULT);
      cv.threshold(blurred, thresholded, threshold, 255, cv.ThresholdTypes.THRESH_BINARY.value);



      // if (showThresholded) {
      var src = thresholded.data();
      // var dst = capture.pixels;
      var n = src.length;
      var j = 0;
      
      for (var i = 0; i < n; i++) {
        pixels[j++] = src[i];
        pixels[j++] = src[i];
        pixels[j++] = src[i];
        pixels[j++] = 255;
        }
      capture.updatePixels();

    }
    // face_img = capture.get(0, 0, capture.width, capture.height);
    // let dst = new cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    color_scalar = new cv.Scalar(0, 255, 0);
    cv.findContours(thresholded, contours, hierarchy, 3, 2, [0, 0]);
    // for (var i = 0; i < contours.size(); i++) {
    //   cv.drawContours(thresholded, contours, i, color, 1, cv.LINE_8, hierarchy, 3, [0,0]);
    // }
    // cv.drawContours(thresholded, contours, -1, color_scalar, 1, cv.LINE_8, hierarchy, 3, [0,0]);
  }
  // }
  

  // image(capture, 0, 0, w, h);

  // push();
  // translate(-width/2, -height/2);

  let crayon_colors = [[247, 196, 145], [255, 192, 41], [157, 60, 40], [195, 62, 162], [154, 59, 184], [125, 64, 189], [47, 183, 244], [193, 246, 236], [110, 251, 89], [3, 181, 99], [9, 116, 81], [6, 136, 191], [13, 84, 176], [2, 114, 254], [245, 250, 116], [239, 238, 11], [254, 191, 42], [237, 79, 24], [246, 29, 24], [240, 8, 19], [250, 134, 187], [251, 206, 180], [187, 185, 189], [26, 25, 24], [154, 154, 158], [189, 184, 88]];


  
  if (contours && !showThresholded) {
    contour_img.noFill();
    // noStroke();
    // console.log(contours.size());
    for (var i = 0; i < contours.size(); i++) {

        // fill(0);
        contour_img.strokeWeight(8);
        var contour = contours.get(i);
        var vertex_dict = [];
        // contour_img.beginShape();
        var k = 0;
        for (var j = 0; j < contour.total(); j++) {
            var x = contour.get_int_at(k++);
            var y = contour.get_int_at(k++);
            vertex_dict[j] = [x,y];
            // contour_img.curveVertex(x, y);
        }     

        vertex_dict_shuffled = shuffle(vertex_dict);

        contour_img.beginShape();
        for (var v = 0; v < vertex_dict_shuffled.length; v+=20) {
          // randomSeed(i);
          contour_img.stroke(random(crayon_colors)[0], random(crayon_colors)[1], random(crayon_colors)[2]);
          contour_img.curveVertex(vertex_dict_shuffled[v][0], vertex_dict_shuffled[v][1]);
        }
        contour_img.endShape(CLOSE);

        contour_img.stroke(80, 25, 24);
        contour_img.beginShape();
        for (var v = 0; v < vertex_dict.length; v+=10) {
          // randomSeed(v);                       
          // contour_img.stroke(random(crayon_colors)[0], random(crayon_colors)[1], random(crayon_colors)[2]);
          contour_img.curveVertex(vertex_dict[v][0], vertex_dict[v][1]);
        }        
        contour_img.endShape(CLOSE);
        
      }
    }
    // pop();

    
    // console.log(contour_img.get(5, 100));
    // image(face_img, w/2, h/2, w, h);


  // let capture = cam.get();
  
//   capture.loadPixels();

//   // face_img = cam.get(0, 0, cam.width, cam.height);
  
//   let threshold = map(mouseX, 0, width, 0, 1);
  
//   for (let x = 0; x < capture.width; x++) {
//     for (let y = 0; y < capture.height; y++) {
//       let i = (x + y * capture.width) * 4;
//       let r = pixels[i+0];
//       let g = pixels[i+1];
//       let b = pixels[i+2];
//       let a = pixels[i+3];
      
//       let pixelColor;
//       // console.log(g);
//       if ((g / 255) > 0.5) {
//         pixelColor = 255;
//       } else {

//         pixelColor = 0;
//       }
      
//       pixels[i+0] = pixelColor;
//       pixels[i+1] = pixelColor;
//       pixels[i+2] = pixelColor;
//     }
//   }
//   capture.updatePixels();
  
  // noStroke();
  for (var i = 0; i < speech_history.length; i++) {
    randomSeed((i+1)*100);
    // noStroke();
    let random_col = random(crayon_colors);
    contour_img.textSize(random(40,100));
    contour_img.fill(random_col);
    contour_img.stroke(random_col);
    // contour_img.text(speech_history[i], w/4+sin(millis()*0.001 + 2/3*PI + i)*w/4, h/2+sin(millis()*0.001 + PI/4 + i)*h/2);
    contour_img.text(speech_history[i].toUpperCase(), random(w/1.5), random(h), 300, 400);
  }
 

  shader(theShader);
  
  theShader.setUniform("u_resolution", [width, height]);
  theShader.setUniform("u_time", millis() / 1000.0);
  theShader.setUniform("u_mouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  theShader.setUniform("rockImg", rock_img);
  theShader.setUniform("lineImg", line_img);
  theShader.setUniform("faceImg", face_img);
  theShader.setUniform("contourImg", contour_img);
  theShader.setUniform("textImg", text_img);
  theShader.setUniform('camera', capture);

  // rect gives us some geometry on the screen
  fill(255,0,0);
  rect(0,0,width, height);
  
  p.position(0, 0);
  // change element p's background color
  p.style('background', '#3f3f3f');

  // add paddings to element p
  p.style('padding', '10px');
  p.style('color', '#ffffff');
  
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}