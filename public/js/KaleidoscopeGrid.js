function KaleidoscopeGrid(texture)
{
	this.mesh;
	this.texture = texture;

	this.createGeometry = function()
	{
		
		this.mesh = new THREE.Object3D();


		var tileMat = new THREE.MeshBasicMaterial({map:this.texture, side:THREE.DoubleSide});

		var theta = 0;
		var numSteps = numAxes;
		var step = 2*Math.PI / numSteps;
		var radius = 1;

		var tileGeometry = new THREE.Geometry();
		tileGeometry.vertices.push(new THREE.Vector3(0,0,0));

		var snapStep; // number of steps between simplified shape vertices
		var stepAngle;
		var rotOffset;

		// compute tile width
		var p1 = new THREE.Vector2(radius*Math.cos(0), radius*Math.sin(0));
		var p2 = new THREE.Vector2(radius*Math.cos(stepAngle), radius*Math.sin(stepAngle));
		var dist = p1.distanceTo(p2);
		var a = dist / 2;
		var c = radius;
		var b = Math.sqrt(c*c - a*a);
		var tileWidth;
		var tileHeight;
		var tileRowOffset;


		// find out if numAxes is factor of 4 or 6
		if ( !(numAxes % 6) )
		{
			// factor of 6
			snapStep = numAxes/6;
			stepAngle = (2*Math.PI) / 6;
			rotOffset = stepAngle / 2;

			tileWidth = b*2;
			tileHeight = c + a;
			tileRowOffset = b;
		}
		else
		{
			// factor of 4
			snapStep = numAxes/4;
			stepAngle = (2*Math.PI) / 4;
			rotOffset = 0;

			tileWidth = c * 2;
			tileHeight = c;
			tileRowOffset = c;
		}
		

		// add vertices
		for (var i=0; i<numSteps; i++)
		{
			var mod = i % snapStep;
			var ratio = mod / snapStep;
			var position = Math.floor(i/snapStep);
			var angle1 = stepAngle * position;
			var angle2 = stepAngle * (position+1);
			var x, y;

			if (mod == 0) 
			{
				// standard vertex position
				x = radius * Math.cos(theta);
				y = radius * Math.sin(theta);
			}
			else
			{
				// interpolate between angle1 and angle2
				var x1 = radius * Math.cos(angle1);
				var y1 = radius * Math.sin(angle1);

				var x2 = radius * Math.cos(angle2);
				var y2 = radius * Math.sin(angle2);

				x = x1 + ( (x2-x1) * ratio );
				y = y1 + ( (y2-y1) * ratio );
			}

			tileGeometry.vertices.push(new THREE.Vector3(x ,y ,0));
			theta += step; 
		}

		// add faces
		for (var i=0; i<numSteps; i++)
		{
			var v1 = i+1;
			var v2 = i+2;
			if (v2 > numSteps) v2 = 1;
			tileGeometry.faces.push( new THREE.Face3( 0, v1, v2 ) );
		}


		tileGeometry.computeBoundingSphere();
		tileGeometry.computeBoundingBox();


		// set UV mapping
		tileGeometry.faceVertexUvs[0] = [];

		var mapWidth = 1/snapStep;
		var diff = 1 - mapWidth;
		var mapLeft = diff/2;
		var mapRight = 1 - diff/2;

		for (i = 0; i < tileGeometry.faces.length ; i++) 
		{
			if (i%2)
			{
				tileGeometry.faceVertexUvs[0].push([
					new THREE.Vector2( 0.5,  0),
					new THREE.Vector2( mapLeft, 1),
					new THREE.Vector2(  mapRight, 1)
				]);
			}
			else
			{
				tileGeometry.faceVertexUvs[0].push([
					new THREE.Vector2( 0.5,  0),
					new THREE.Vector2( mapRight, 1),
					new THREE.Vector2(  mapLeft, 1)
				]);
			}	
		}

		tileGeometry.uvsNeedUpdate = true;


		var tileRow = new THREE.Object3D();
		this.mesh.add(tileRow);

		var scale = bufferSize/3;

		var tileMesh = new THREE.Mesh(tileGeometry, tileMat);
		tileMesh.scale.set( scale, scale, 1 );
		tileMesh.rotation.z = rotOffset;
		tileRow.add(tileMesh);

		var tileCountX = 15;
		for (var i=0; i<tileCountX; i++)
		{
			var tileMeshLeft = tileMesh.clone();
			tileMeshLeft.position.x -= (tileWidth * scale) * (i+1);
			tileRow.add(tileMeshLeft);

			var tileMeshRight = tileMesh.clone();
			tileMeshRight.position.x += (tileWidth * scale) * (i+1);
			tileRow.add(tileMeshRight);
		}

		var tileCountY = 10;
		for (var i=0; i<tileCountY; i++)
		{
			var tileRowTop = tileRow.clone();
			tileRowTop.position.y += tileHeight * scale * (i+1);
			if (!(i%2)) tileRowTop.position.x += tileRowOffset * scale;
			this.mesh.add(tileRowTop);

			var tileRowBottom = tileRow.clone();
			tileRowBottom.position.y -= tileHeight * scale * (i+1);
			if (!(i%2)) tileRowBottom.position.x += tileRowOffset * scale;
			this.mesh.add(tileRowBottom);
		}

		
	}
}