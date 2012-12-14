// bind

Function.prototype.bind = function( scope )
{
	var _function = this;
	return function()
	{
		return _function.apply( scope, arguments );
	}
}

// dom ready

$( document ).ready( function()	{

	if( Detector.webgl === false )
	{
		Detector.addGetWebGLMessage();
		return;
	}
	var app = new Application();
	app.init();

});

// Main Application

var Application = ( function()
{
	function Application()
	{
		this.domContainer = $( "#container" );

		this.skyColor = 0xff00ff;
	}
	Application.prototype.constructor = Application;

	Application.prototype.init = function init()
	{
		this.timeOnPath = 0;
		this.speed = 0.025;
		this.acc = 0.001;
		this.speedMax = 0.1;

		// Renderer
		this.renderer = new THREE.WebGLRenderer({
			  antialias: true
			, preserveDrawingBuffer: true
			, clearColor: this.skyColor
			, clearAlpha: 1
		});
		this.renderer.setFaceCulling( 0 );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setClearColorHex(0x000000, 0);
		this.renderer.clear();
		this.domContainer.append( this.renderer.domElement );

		// Scene
		this.scene = new THREE.Scene();

		// Camera
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 500;
		this.camera.position.y = 550;
		this.camera.rotation.x = -Math.PI * .4;
		this.scene.add( this.camera );

		this.createLights();
		this.createExperiment();

		// Stats
		this.stats = new Stats();
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.top = "0px";
		container.appendChild( this.stats.domElement );

		this.animate();
	}

	Application.prototype.createLights = function createLights()
	{
		this.pointLight = new THREE.PointLight( 0xffffff, 1.0 );
		this.pointLight.position.z = 30;
		this.scene.add( this.pointLight );

		var light = new THREE.DirectionalLight( 0xff00ff, 1.3 );
		light.position.set( -100, 1, -100 );
		this.scene.add( light );

		light = new THREE.DirectionalLight( 0x0000ff, 0.1 );
		light.position.set( 100, 50, -100 );
		this.scene.add( light );
	}

	Application.prototype.createExperiment = function createExperiment()
	{
		this.svgReader = new SVGReader();
		this.svgReader.parse();

		this.createFloor();
		this.createObjects();
		this.createPath();
	}

	Application.prototype.createFloor = function createFloor()
	{
		this.floor = new Floor();
		this.scene.add( this.floor );
	}

	Application.prototype.createObjects = function createObjects()
	{
		this.star = new Star();
		this.scene.add( this.star );

		this.line = new Line();
		this.scene.add( this.line );
	}

	Application.prototype.createPath = function createPath()
	{
		this.path = new THREE.Shape();
		var dataPath = this.svgReader.data[ "path" ];
		for( var i = 0; i < dataPath.length; i++ )
		{
			if( dataPath[ i ].cmd == "M" )
			{
				this.path.moveTo( dataPath[ i ].p.x, dataPath[ i ].p.y );
			}
			else
			{
				this.path.bezierCurveTo( dataPath[ i ].cp0.x, dataPath[ i ].cp0.y, dataPath[ i ].cp1.x, dataPath[ i ].cp1.y, dataPath[ i ].p.x, dataPath[ i ].p.y );
			}
		}
	}

	Application.prototype.animate = function animate()
	{
		this.render();
		requestAnimationFrame( this.animate.bind( this ) );
	}

	Application.prototype.render = function render()
	{
		this.renderer.render( this.scene, this.camera );
		
		if( this.speed < this.speedMax )
		{
			this.speed += this.acc;
		}

		this.timeOnPath += this.speed * Globals.clock.getDelta();
		if( this.timeOnPath > 1 )
			return;

		var p = this.path.getPointAt( this.timeOnPath );
		this.star.render( p );
		this.line.render( p );

		this.stats.update();
	}

	return Application;

} )();