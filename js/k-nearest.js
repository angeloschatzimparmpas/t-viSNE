function kNearestNeighbors(k, points, points2d) {

	var averagekNN = 0;
	var Distances = [];
  var Distances2d = [];
	//var sortedDistances = [];
	var point = points;
  var point2d = points2d;
		/*
		 * Loop through our nodes and look for unknown types.
		 */
	for (var i=0; i<point.length; i++){
/*		
			if (this.nodes.hasOwnProperty(i)) {
			
				if ( ! this.nodes[i].type) {*/
					/*
					 * If the node is an unknown type, clone the nodes list and then measure distances.
					 */
					
					/* Clone nodes *//*
					this.nodes[i].neighbors = [];
					
					for (var j in this.nodes) {
						if ( ! this.nodes[j].type)
							continue;
						this.nodes[i].neighbors.push( new KNN.Item(this.nodes[j]) );
					}*/

					/* Measure distances */
					Distances[i] = measureDistances(point[i],points);
          Distances2d[i] = measureDistances(point2d[i],points2d);
					Distances[i].sort();
          Distances2d[i].sort();
					/* Sort by distance */
					//sortByDistance();
					/* Guess type */
					//this.type = this.nodes[i].guessType(this.k);
			}
			//console.log(Distances);
	sum = LimitKNeighbor(Distances, k);
  sum2d = LimitKNeighbor(Distances2d, k);
  averagekNN = Math.round((sum2d / sum) * 100) / 100;
	return averagekNN;

}

	function measureDistances(point,points) {
		var neighborDistances = [];
		var checkForSame = [];
		for (var j=0; j<points.length; j++){

				neighborDistances[j] = Math.sqrt( (point.x-points[j].x)*(point.x-points[j].x) + (point.y-points[j].y)*(point.y-points[j].y) );
		}

		//neighborDistances = sortByDistance(neighborDistances);
		return neighborDistances;
	}
	
	function LimitKNeighbor(Distances, k) {
	var DistancesSliced = [];
	var sum = 0;
		for (var i = 0; i < Distances.length; i++) {
			//for (var j = 0; j < Distances.length; j++) {
				DistancesSliced[i] = Distances[i].slice(0,k);
				for (var j = 0 ; j < k ; j++){
					sum = DistancesSliced[i][j] + sum;
				}
				//sum = DistancesSliced[i] + sum;
			//}
		}
		//console.log(sum);
		return sum;
		//console.log(DistancesBetweenAllThePoints[0][0]);
		//console.log(DistancesBetweenAllThePoints);
/*
		var guess = {type: false, count: 0};
		
		for (var type in types) {
			if (types[type] > guess.count) {
				guess.type = type;
				guess.count = types[type];
			}
		}

		this.guess = guess;

		return types;
	};

	calculateRanges = function() {
		this.areas = {min: 1000000, max: 0};
		this.rooms = {min: 1000000, max: 0};
		
		for (var i in this.nodes) {
			if (this.nodes.hasOwnProperty(i)) {
			
				if (this.nodes[i].rooms < this.rooms.min) {
					this.rooms.min = this.nodes[i].rooms;
				}

				if (this.nodes[i].rooms > this.rooms.max) {
					this.rooms.max = this.nodes[i].rooms;
				}

				if (this.nodes[i].area < this.areas.min) {
					this.areas.min = this.nodes[i].area;
				}

				if (this.nodes[i].area > this.areas.max) {
					this.areas.max = this.nodes[i].area;
				}
			}
		}

	};*/
}

/*
  function findNearest(point) {
    
    // TODO: make this more efficient by not recalculating quadtree at
    //       each call of findNearest()
    
    // Extract points from the data array
    //points = data.map(function(d) { return [x(d), y(d)]; });
    
    // Add quadtree info to the points
    //nodes = quadtreeify(points);

    // Flag k-nearest points by adding `selected` property set to `true`
    kNearest(new Array(nodes), [], point);
    
    // Return nearest points along with indices from origianl `data` array
    return points
      .map(function(d, i) {
        var datum = [d[0], d[1]];
        datum.i = i;
        return d.selected ? datum : null; 
      })
      .filter(function(d) { return d !== null; });
  }
  
  findNearest.extent = function(_) {
    if (!arguments.length) return extent;
    extent = _;
    //quadtree.extent(extent);
    return findNearest;
  };
  
  findNearest.data = function(_) {
    if (!arguments.length) return data;
    data = _;
    return findNearest;
  };
  
  findNearest.k = function(_) {
    if (!arguments.length) return k;
    k = _;
    return findNearest;
  };
  
  findNearest.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return findNearest;
  };
  
  findNearest.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return findNearest;
  };

  return findNearest;
  
  // Add quadtree information to each point (i.e., rectangles, depth, ...)
  function quadtreeify(points) {
    var nodes = quadtree(points);
    nodes.depth = 0;
    nodes.visit(function(node, x1, y1, x2, y2) {
      node.x1 = x1;
      node.y1 = y1;
      node.x2 = x2;
      node.y2 = y2;
      for (var i = 0; i < 4; i++) {
        if (node.nodes[i]) node.nodes[i].depth = node.depth + 1;
      }
    });
    return nodes;
  }
  
  // calculate the euclidean distance of two points with coordinates a(ax, ay) and b(bx, by)
  function euclideanDistance(ax, ay, bx, by) {
    return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
  }
  
  // calculate minimum distance between search point rectangles
  function minDistance(x, y, x1, y1, x2, y2) {
    var dx1 = x - x1,
        dx2 = x - x2,
        dy1 = y - y1,
        dy2 = y - y2;
    
    // x is between x1 and x2
    if (dx1 * dx2 < 0) {
      // (x, y) is inside the rectangle
      if (dy1 * dy2 < 0) {
        return 0; // return 0 as a point in the rectangle
      }
      return Math.min(Math.abs(dy1), Math.abs(dy2));
    }
    
    // y is between y1 and y2 (and not inside rectangle)
    if (dy1 * dy2 < 0) {
      return Math.min(Math.abs(dx1), Math.abs(dx2));
    }
    return Math.min( 
      Math.min(euclideanDistance(x,y,x1,y1), euclideanDistance(x,y,x2,y2)), 
      Math.min(euclideanDistance(x,y,x1,y2), euclideanDistance(x,y,x2,y1))
    );
  }
  
  // Find the nodes within the specified rectangle (used recursively)
  function kNearest(bestQueue, resultQueue, point) {
    var x = point[0],
        y = point[1];
    
    // sort children according to their minDistance/euclideanDistance to search point
    bestQueue.sort(function(a, b) {
      // add minDistance to nodes if not there already
      [a, b].forEach(function(d) {
        if (d.minDistance === undefined) {
          d.scanned = true;
          if (d.leaf) {
            d.point.scanned = true;
            d.minDistance = euclideanDistance(x, y, d.x, d.y);
          }
          else {
            d.minDistance = minDistance(x, y, d.x1, d.y1, d.x2, d.y2);
          }
        }
      });
      return b.minDistance - a.minDistance;
    });
    
    // add nearest leafs (if any)
    for (var i = bestQueue.length - 1; i >= 0; i--) {
      var elem = bestQueue[i];
      if (elem.leaf) {
        elem.point.selected = true;
        bestQueue.pop();
        resultQueue.push(elem);
      } else { break; }
      if (resultQueue.length >= k) break;
    }
    
    // check if enough points found
    if (resultQueue.length >= k || bestQueue.length == 0) { return; }
    else {
      // ...otherwise add child nodes to bestQueue and recurse
      var visitedNode = bestQueue.pop();
      visitedNode.visited = true;
      visitedNode.nodes.forEach(function(d) {
        bestQueue.push(d);
      });
      kNearest(bestQueue, resultQueue, point);
    }
  }
  */