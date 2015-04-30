
var width = $('.overlay').width();
var height = $('.overlay').height();
var mouse = { x:0, y:0 }, INTERSECTED, mouseVector = new THREE.Vector3(0, 0, 0);

var raycaster = new THREE.Raycaster();
var renderer = new THREE.WebGLRenderer({antialias: true});
var start = Date.now();
var spotPulse = { multiplicator:1 };


renderer.setSize(width, height);

$('.scene').prepend(renderer.domElement);

renderer.shadowMapEnabled = true;
renderer.setClearColor(0x000000, 1.0);
renderer.clear();


var scene = new THREE.Scene();



/*
	Camera
*/
var camera = new THREE.PerspectiveCamera(45, width/height, 1, 10000);
camera.position.z = 50;
camera.position.x = 2700;
camera.position.y = 450;

camera.lookAt(scene.position);




/*
	Main Plane
*/
var planeGeo = new THREE.PlaneGeometry (4500, 8500, 100, 100);
var planeTex = THREE.ImageUtils.loadTexture('img/tex_512.jpg');
planeTex.wrapS = planeTex.wrapT = THREE.RepeatWrapping;
planeTex.repeat.set( 10, 10 );

var planeMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, wireframe: false, map: planeTex  });
var plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI/2;
plane.position.y = -25;
plane.receiveShadow = true;
plane.castShadow = true;
plane.updateMatrixWorld();
plane.verticesNeedUpdate = true;
plane.normalsNeedUpdate = true;
plane.colorsNeedUpdate = true;
scene.add(plane);




/*
	Transparent Plane
*/
var planeGeoA = new THREE.PlaneGeometry (4800, 8500, 50, 50);
var planeMatA = new THREE.MeshNormalMaterial ({ transparent: true, opacity: 0 });
var planeA = new THREE.Mesh(planeGeoA, planeMatA);
planeA.rotation.x = -Math.PI/2;
planeA.position.y = 230;
scene.add(planeA);






/*
	AmbientLight
*/
var AmbientLight = new THREE.AmbientLight( 0x333333 ); // soft white light
scene.add( AmbientLight );



/*
	Spotlight on Mouse
*/
var spotLight = new THREE.SpotLight(0xffe29b, 1, 0.0, 20.0, 5.0);
spotLight.position.set( 100, 650, 150 ); //350
spotLight.castShadow = true;
//spotLight.shadowCameraVisible = true;
spotLight.target.position.set( 1800, 250,  0 );
spotLight.target.updateMatrixWorld();
scene.add(spotLight);




/*
	Renderer
*/
function render() {
	requestAnimationFrame( render );
	
	
	//raytracer for mousepos
	raycaster.setFromCamera( mouse, camera );	
	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );

	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[ 0 ].object ) {
			INTERSECTED = intersects[ 0 ].object;		
		}
		
		mouseVector = intersects[ 0 ].point;
		mouseVector.y = 0;
		
	} else {
		INTERSECTED = null;
	}
	
	
	
	//update plane vertices
	$.each( plane.geometry.vertices , function( index, value ) {
		
		value.offsetZ = 0;
		
		var vector = plane.localToWorld( value.clone() );
		vector.y = 0;
		var xDinstance = vector.distanceTo( mouseVector );
		
		if( xDinstance <= 300){
			var percent = 1 - (xDinstance / 300);
			//console.log(xDinstance, percent);
			value.offsetZ = 250 * percent * spotPulse.multiplicator;
		}
		
		value.z = value.waveOffsetZ + value.offsetZ;
	});
	
	plane.geometry.verticesNeedUpdate = true;
	
	
	
	renderer.render( scene, camera );
}
render();




/*
	Random Animation
*/
var newZ, animTime;
function testAnim( vector ){
	newZ = Math.floor(Math.random() * 50) + -20;
	//var ghostVector = vector.clone();
	//ghostVector.z -= vector.offsetZ;
	//console.log( newZ );
	animTime = (Math.random() * (1.5 - 0.5) + 0.5).toFixed(1);
	
	if( typeof vector.waveOffsetZ == 'undefined' ) vector.waveOffsetZ = 0;
	
	TweenLite.to(vector, animTime, { waveOffsetZ:newZ, ease:Quad.easeInOut, onComplete:testAnim, onCompleteParams:[vector] });
}
$.each( plane.geometry.vertices , function( index, value ) {
	value.offsetZ = 0;
	testAnim( value );
});




/*
	Click
*/
function spotPulseStart( ){
	var newVal = (Math.random() * (1.8 - 0.9) + 0.9).toFixed(1);
	
	newVal = -1
	
	TweenLite.to(spotPulse, 0.3, { multiplicator:newVal, ease:Quad.easeInOut, onComplete:spotPulseEnd });
}

function spotPulseEnd( ){
	TweenLite.to(spotPulse, 0.8, { multiplicator:1, ease:Quad.easeOutIn });
}

$( ".overlay" ).click(function() {
	spotPulseStart();
});




/*
	MouseMove
*/
$( ".overlay" ).mousemove(function( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;	
	
	spotLight.position.x = mouseVector.x;
	spotLight.position.z = mouseVector.z;
	spotLight.target.position.set( mouseVector.x, 0,  mouseVector.z );
	spotLight.target.updateMatrixWorld() 
	
});




