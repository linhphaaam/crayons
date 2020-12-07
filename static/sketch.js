// a shader variable

let theShader;
let capture;
let rock_img;
let contour_img;
let paper_img;

let speechRec;
let lang;
let continuous = true;
let interim = false;

let body;
let color_picker;

let fontsize = 32;
let speech_history = [];

let color_picked = false;

var w = 1200;
var h = 900;

function preload(){
  // load the shader
  theShader = loadShader('static/shader.vert', 'static/shader.frag');
  rock_img = loadImage('assets/rock.jpg');
  paper_img = loadImage('assets/paper_texture.png');
  paper_img.resize(w, h);
}

function setup() {
  // disables scaling for retina screens which can create inconsistent scaling between displays
  pixelDensity(1);
  
  // shaders require WEBGL mode to work
  createCanvas(w, h, WEBGL).parent('canvasHolder');
  noStroke();
  lang = navigator.language || 'en-US';
  speechRec = new p5.SpeechRec(lang, gotSpeech);
  speechRec.start(continuous, interim);
  capture = createCapture(VIDEO);
  capture.size(w, h);
  contour_img = createGraphics(capture.width, capture.height);
  contour_img.textSize(fontsize);
  face_img = capture.get(0, 0, capture.width, capture.height); 
  capture.hide();
}


// once the record ends or an error happens, start() again. this should keep it going
function restart(){
	speechRec.start(continuous, interim);
}

function gotSpeech() {
  speech_history.push(speechRec.resultString);
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


function hexToRGB(h) {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

  // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }
  
  // return r + "," + g + "," + b;
  return r.toString() + "," + g.toString() + "," + b.toString();
}

function draw() {  
  speechRec.onEnd = restart;
  // contour_img.background(paper_img);
  // contour_img.background(255, 255, 255, 0);
  // contour_img.blendMode(HARD_LIGHT);
  contour_img.background('rgba(24,20,17, 1)');
  // contour_img.blendMode(NORMAL);
  // get outline color selections
  var outline_color_colorful = document.getElementById("colorful_outline").checked;
  var outline_color_black = document.getElementById("black_outline").checked;
  var outline_color_white = document.getElementById("white_outline").checked;

  // get clear text button
  var clear_text_button = document.getElementById("clear_text_button");

  clear_text_button.onclick = function() {
    speech_history = [];
  }
  take_screenshot.onclick = function() {
    saveCanvas('myCanvas', 'jpg');
  }
  body = document.getElementById("screen");


  // get background color picker
  // var background_switch_value = document.getElementById("background_switch").checked;


  color_picker = document.getElementById("color_picker");

  color_picker.oninput = function() {
    color_picked = true;
    return true;
  }

  // if (background_switch_value == false) {
  //   body.style.backgroundColor = "rgb(24,20,17)";
  //   body.style.color = "rgb(251,245,237)";
  //   contour_img.background(24,20,17);
  // } else {
  //   body.style.backgroundColor = "rgb(251,245,237)";
  //   body.style.color = "rgb(24,20,17)";
  //   contour_img.background(251,245,237);
  // } 
  
  if (color_picked) {
    // body.style.backgroundColor = color_picker.value;
    // contour_img.blendMode(HARD_LIGHT);
    contour_img.background(color_picker.value);
    // contour_img.blendMode(NORMAL);
  }


  // contour_img.blendMode(OVERLAY);
  // contour_img.background(paper_img);
  // contour_img.blendMode(NORMAL);


  if (cvReady()) {
    capture.loadPixels();  
    if (pixels.length > 0) {
      captureMat.data().set(pixels);

      // var blurRadius = select('#blurRadius').value();
      // blurRadius = map(blurRadius, 0, 100, 1, 10);
      var blurRadius = 5;

      var threshold = select('#threshold').value();
      threshold = map(threshold, 0, 100, 0, 255);

      cv.cvtColor(captureMat, gray, cv.ColorConversionCodes.COLOR_RGBA2GRAY.value, 0);
      cv.blur(gray, blurred, [blurRadius, blurRadius], [-1, -1], cv.BORDER_DEFAULT);
      cv.threshold(blurred, thresholded, threshold, 255, cv.ThresholdTypes.THRESH_BINARY.value);

      var src = thresholded.data();
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
  
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    color_scalar = new cv.Scalar(0, 255, 0);
    cv.findContours(thresholded, contours, hierarchy, 3, 2, [0, 0]);
  }

  let crayon_colors = [[247, 196, 145], [255, 192, 41], [157, 60, 40], [195, 62, 162], [154, 59, 184], [125, 64, 189], [47, 183, 244], [193, 246, 236], [110, 251, 89], [3, 181, 99], [9, 116, 81], [6, 136, 191], [13, 84, 176], [2, 114, 254], [245, 250, 116], [239, 238, 11], [254, 191, 42], [237, 79, 24], [246, 29, 24], [240, 8, 19], [250, 134, 187], [251, 206, 180], [187, 185, 189], [26, 25, 24], [154, 154, 158], [189, 184, 88]];

  
  if (contours) {
    contour_img.noFill();
    for (var i = 0; i < contours.size(); i++) {
        contour_img.strokeWeight(8);
        var contour = contours.get(i);
        var vertex_dict = [];
        var k = 0;

        for (var j = 0; j < contour.total(); j++) {
            var x = contour.get_int_at(k++);
            var y = contour.get_int_at(k++);
            vertex_dict[j] = [-x+capture.width,y];
        }     

        vertex_dict_shuffled = shuffle(vertex_dict);

        // contour_img.beginShape();
        for (var v = 0; v < vertex_dict_shuffled.length; v+=20) {
          let counter = 0;
          contour_img.beginShape();
          for (var t = 0; t < vertex_dict_shuffled.length; t+=1) {
            let v1 = createVector(vertex_dict_shuffled[v][0], vertex_dict_shuffled[v][1]);
            let v2 = createVector(vertex_dict_shuffled[t][0], vertex_dict_shuffled[t][1]);
            // console.log(v1);
            if (v1.dist(v2) < 120) {
              contour_img.stroke(random(crayon_colors)[0], random(crayon_colors)[1], random(crayon_colors)[2]);
              contour_img.curveVertex(vertex_dict_shuffled[t][0], vertex_dict_shuffled[t][1]); 
              counter++ 
              if (counter > 15) {
                break;
              }
            }
          }
          contour_img.endShape(CLOSE);
          // contour_img.stroke(random(crayon_colors)[0], random(crayon_colors)[1], random(crayon_colors)[2]);
          // contour_img.curveVertex(vertex_dict_shuffled[v][0], vertex_dict_shuffled[v][1]);
        }
        // contour_img.endShape(CLOSE);

        contour_img.stroke(80, 25, 24);
        contour_img.beginShape();
        for (var v = 0; v < vertex_dict.length; v+=5) {
          // randomSeed(v);                       
          // contour_img.stroke(random(crayon_colors)[0], random(crayon_colors)[1], random(crayon_colors)[2]);
          if (outline_color_white) {
          contour_img.stroke(251,245,237); // light outline
          } else if (outline_color_black) {
          contour_img.stroke(24,20,17); // dark outline
          } else if (outline_color_colorful) {
            contour_img.stroke(random(crayon_colors)[0], random(crayon_colors)[1], random(crayon_colors)[2]); // colorful outline
          }
          contour_img.curveVertex(vertex_dict[v][0], vertex_dict[v][1]);
        }        
        contour_img.endShape(CLOSE);
        
      }
    }

  for (var i = 0; i < speech_history.length; i++) {
    randomSeed((i+1)*100);
    // noStroke();
    let random_col = random(crayon_colors);
    contour_img.textSize(random(40,100));
    contour_img.fill(random_col);
    contour_img.stroke(random_col);
    contour_img.text(speech_history[i].toUpperCase(), random(5/6*w), random(3/4*h), 300, 400);
  }

  contour_img.blendMode(OVERLAY);
  contour_img.background(paper_img);
  contour_img.blendMode(BLEND);

  shader(theShader);
  
  theShader.setUniform("u_resolution", [width, height]);
  theShader.setUniform("u_time", millis() / 1000.0);
  theShader.setUniform("u_mouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  theShader.setUniform("rockImg", rock_img);
  theShader.setUniform("contourImg", contour_img);
  theShader.setUniform('camera', capture);

  // rect gives us some geometry on the screen
  rect(0,0, w, h);

}

function windowResized(){
  resizeCanvas(windowWidth*0.7, (windowWidth*0.7)*3/4);
  paper_img.resize(windowWidth*0.7, (windowWidth*0.7)*3/4);
}