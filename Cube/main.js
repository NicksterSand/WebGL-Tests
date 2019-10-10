var cubeRotation = 0.0;
function main(){
	const canvas = document.getElementById("glCanvas");
	const gl = canvas.getContext("webgl");

	if(gl === null){
		alert("Could not initialize WebGL!");
		return;
	}
	
	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec2 aTextureCoord;
		attribute vec4 aColor;

		uniform mat4 uModelViewMatrix;
		uniform mat4 uProjectionMatrix;
		
		varying highp vec2 vTextureCoord;
		varying lowp vec4 vColor;	

		void main(){
			gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
			vTextureCoord = aTextureCoord;
			vColor = aColor;
		}
	`;
	const fsSource = `
		varying highp vec2 vTextureCoord;
		varying lowp vec4 vColor;
		uniform sampler2D uSampler;
		void main(){
			lowp vec4 black = vec4(0.0,0.0,0.0,1.0);
			lowp vec4 white = vec4(1.0,1.0,1.0,1.0);
			lowp vec4 temp = white - texture2D(uSampler, vTextureCoord);
			temp = temp * vColor;
			gl_FragColor = temp + texture2D(uSampler, vTextureCoord);
		}
	`;
	
	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
			textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
			color: gl.getAttribLocation(shaderProgram, 'aColor')
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
			uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
		},
	};
	buffers = initBuffers(gl);
	const texture = loadTexture(gl, 'https://i.imgur.com/mTrE2a3.png');

	var then = 0;
	function render(now){
		now *= 0.001;
		const deltaTime = now - then;
		then = now;
		drawScene(gl, programInfo, buffers, texture, deltaTime);
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}
function initShaderProgram(gl, vsSource, fsSource){
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
	
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}
function loadShader(gl, type, source){
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert('Could not compile shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}
function initBuffers(gl){
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	const positions = [
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,

		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,

		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,

		-1.0, -1.0,  -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,

		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,

		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	const faceColors = [
		[0.7, 0.7, 0.7, 1.0],
		[0.7, 0.0, 0.0, 1.0],
		[0.0, 0.7, 0.0, 1.0],
		[0.0, 0.0, 0.7, 1.0],
		[0.7, 0.7, 0.0, 1.0],
		[0.7, 0.0, 0.7, 1.0],
	];
	var colors = [];
	for(var j = 0; j < faceColors.length; j++){
		const c = faceColors[j];
		colors = colors.concat(c,c,c,c);
	}
	const colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	const indices = [
		0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23
	];
	
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	const textureCoordinates = [
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

	return{
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
		color: colorBuffer
	};
}
function drawScene(gl, programInfo, buffers, texture, deltaTime){
	gl.clearColor(0.0,0.0,0.0,1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	const fieldOfView = 45*Math.PI/180;
	const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100;
	const projectionMatrix = mat4.create();

	mat4.perspective(projectionMatrix,fieldOfView,aspect,zNear,zFar);

	const modelViewMatrix = mat4.create();
	mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0,0.0,-6.0]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0,0,1]);
	mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation*0.7, [0,1,0]);
	{
		const numComponentsPos = 3;
		const numComponentsTexture = 2;
		const numComponentsColor = 4;
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);	
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition,
			numComponentsPos, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
		gl.vertexAttribPointer(programInfo.attribLocations.color,
			numComponentsColor, type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.color);

		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
		gl.vertexAttribPointer(programInfo.attribLocations.textureCoord,
			numComponentsTexture,type, normalize, stride, offset);
		gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
	}
	gl.useProgram(programInfo.program);

	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
	gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
	{
		const offset = 0;
		const vertexCount = 36;
		const type = gl.UNSIGNED_SHORT;
		gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
	}
	cubeRotation += deltaTime;
}
function loadTexture(gl, url){
	const level = 0;
	const internalFormat = gl.RGBA;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const width = 1;
	const height = 1;
	const border = 0;
	const pixel = new Uint8Array([0,0,255,255]);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

	const image = new Image();
	image.crossOrigin = "anonymous";
	image.onload = function(){
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
		if(isPowerOf2(image.width) && isPowerOf2(image.height)){
			gl.generateMipmap(gl.TEXTURE_2D);
		}else{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
	};
	image.src = url;

	return texture;
}
function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}
window.onload = main;
