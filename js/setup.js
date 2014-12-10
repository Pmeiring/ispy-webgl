var ispy = ispy || {};
ispy.detector = {"Collections":{}};
ispy.version = "0.0.1";

ispy.hasWebGL = function() {
  var canvas = document.createElement('canvas');

  if ( ! canvas.getContext('webgl') ) {
    console.log('no webgl');
  } else {
    console.log('webgl');
  }

  if ( ! canvas.getContext('experimental-webgl') ) {
    console.log('no experimental-webgl');
  } else {
    console.log('experimental-webgl');
  }

  if ( ! window.WebGLRenderingContext ) {
    console.log('no WebGLRenderingContext');
  } else {
    console.log('WebGLRenderingContext');
  }

  if ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') ) {
    if ( ! window.WebGLRenderingContext ) {
      return false;
    } else {
      return true;
    }

  } else {
    return false;
  }
}

ispy.init = function() {
  var screen_canvas = document.getElementById('display');

  var scene = new THREE.Scene();
  ispy.scene = scene;

  var width = $('#display').innerWidth();
  var height = $('#display').innerHeight();

  // width, height, fov, near, far, orthoNear, orthoFar
  var camera = new THREE.CombinedCamera(width, height, 70, 1, 100, 1, 48);
  ispy.camera = camera;
  ispy.setCameraHome();

  var renderer;
  if ( ispy.hasWebGL() ) {
    console.log('ispy: using webgl');
    renderer = new THREE.WebGLRenderer({antialias:true});
    ispy.renderer_name = "WebGLRenderer";
  } else {
    console.log('ispy: using canvas');
    renderer = new THREE.CanvasRenderer();
    ispy.renderer = renderer;
    ispy.renderer_name = "CanvasRenderer";
  }

  renderer.setSize(width, height);
  ispy.renderer = renderer;
  screen_canvas.appendChild(ispy.renderer.domElement);

  ispy.stats = new Stats();
  screen_canvas.appendChild(ispy.stats.domElement);
  $('#stats').hide();
  ispy.show_stats = false;

  ispy.inverted_colors = false;

  var axes = new THREE.Object3D();
  axes.name = "axes";
  axes.visible = false;

  var origin = new THREE.Vector3(0,0,0);
  var length = 10;
  // direction, origin, length, color hex, head length, head width
  var arrowX = new THREE.ArrowHelper(new THREE.Vector3(1,0,0),origin,length,0xff0000);
  var arrowY = new THREE.ArrowHelper(new THREE.Vector3(0,1,0),origin,length,0x00ff00);
  var arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0,0,1),origin,length,0x0000ff);

  axes.add(arrowX);
  axes.add(arrowY);
  axes.add(arrowZ);

  ispy.scene.add(axes);
  ispy.show_axes = false;

  // The second argument is necessary to make sure that mouse events are
  // handled only when in the canvas
  var controls = new THREE.TrackballControls(ispy.camera, ispy.renderer.domElement);
  ispy.controls = controls;

  // Add a parent object for each group
  ispy.data_groups.forEach(function(g) {
    var obj_group = new THREE.Object3D();
    obj_group.name = g;
    ispy.scene.add(obj_group);
  })

  ispy.renderer.domElement.addEventListener('mousedown', ispy.onDocumentMouseDown, false);

  $('#version').html("v"+ispy.version);

  window.addEventListener('resize', ispy.onWindowResize, false);

  /*
   https://github.com/mrdoob/three.js/pull/421#issuecomment-1792008
    via
   http://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
  */
  ispy.get_image_data = false;
  ispy.image_data = null;
}

ispy.initDetector = function() {
  // Loading and rendering the actual geometry when WebGL is available
  // works well. With CanvasRenderer, not so well, so load and render
  // the geometry models.

  if ( ispy.renderer_name === "CanvasRenderer" ) {
    $.getScript("./js/models.js")
      .done(function() {
        ispy.addDetector();
      });
  } else if ( ispy.renderer_name === "WebGLRenderer" ) {

    $.when($.getScript("./js/hb.js"),
           $.getScript("./js/ho.js"),
           $.getScript("./js/hehf.js"),
           $.getScript("./js/pixel.js"),
           $.getScript("./js/tib.js"),
           $.getScript("./js/tob.js"),
           $.getScript("./js/tec.js"),
           $.getScript("./js/tid.js"))
           .done(function() { ispy.addDetector(); });
  }
}
