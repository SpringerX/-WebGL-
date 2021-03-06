var PI = 3.1415926535;
var EPSILON = 0.00001;
var NP = 3876;

var ABS = function (x) {
    return (x > 0 ? x : -x);
};
function Vector3Sub(v1, v2) {
    return new THREE.Vector3(v1.x-v2.x,v1.y-v2.y,v1.z-v2.z);
}

function Vector3Add(v1, v2) {
    return new THREE.Vector3(v1.x+v2.x,v1.y+v2.y,v1.z+v2.z);
}

function Vector3Multiply(v1, v2){
    temp = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    return temp;
}

function Vector3Mul(v, num){
    return new THREE.Vector3(v.x * num, v.y * num, v.z * num);
}

function Vector3Length(v){
    length = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2) + Math.pow(v.z, 2));
    return length;
}

var max = function (x, y) {
    return (x > y ? x : y);
};
var Neighbour = function(index, distance) {
    this.index = index;
    this.distance = distance;
};
var lerp_vertex = function (p, n, v0, v1, iso0, iso1, n0, n1, isolevel) {
    var mu;

    if (ABS(isolevel - iso0) < EPSILON) {
        n = n0;
        p = v0;
        return;
    }

    if (ABS(isolevel - iso1) < EPSILON) {
        n = n1;
        p = v1;
        return;
    }

    if (ABS(iso0 - iso1) < EPSILON) {
        n = n0;
        p = v0;
        return;
    }

    mu = (isolevel - iso0) / (iso1 - iso0);

    p.x = v0.x + mu * (v1.x - v0.x);
    p.y = v0.y + mu * (v1.y - v0.y);
    p.z = v0.z + mu * (v1.z - v0.z);

    n.x = n0.x + mu * (n1.x - n0.x);
    n.y = n0.y + mu * (n1.y - n0.y);
    n.z = n0.z + mu * (n1.z - n0.z);
};

function Body() {

    this.edgeTable = [
        0x0, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
        0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
        0x190, 0x99, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
        0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
        0x230, 0x339, 0x33, 0x13a, 0x636, 0x73f, 0x435, 0x53c,
        0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
        0x3a0, 0x2a9, 0x1a3, 0xaa, 0x7a6, 0x6af, 0x5a5, 0x4ac,
        0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
        0x460, 0x569, 0x663, 0x76a, 0x66, 0x16f, 0x265, 0x36c,
        0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
        0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff, 0x3f5, 0x2fc,
        0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
        0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55, 0x15c,
        0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
        0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc,
        0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
        0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
        0xcc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
        0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
        0x15c, 0x55, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
        0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
        0x2fc, 0x3f5, 0xff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
        0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
        0x36c, 0x265, 0x16f, 0x66, 0x76a, 0x663, 0x569, 0x460,
        0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
        0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa, 0x1a3, 0x2a9, 0x3a0,
        0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
        0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33, 0x339, 0x230,
        0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
        0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99, 0x190,
        0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
        0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0];
    this.triTable = [[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1],
        [3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1],
        [3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
        [3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1],
        [9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
        [9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
        [2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1],
        [8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1],
        [9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
        [4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1],
        [3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
        [1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1],
        [4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1],
        [4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1],
        [9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
        [5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1],
        [2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1],
        [9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
        [0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
        [2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1],
        [10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
        [4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1],
        [5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1],
        [5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1],
        [9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1],
        [0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
        [1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1],
        [10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1],
        [8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1],
        [2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1],
        [7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1],
        [9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1],
        [2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1],
        [11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1],
        [9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1],
        [5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
        [11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
        [11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
        [1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1],
        [9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1],
        [5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1],
        [2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
        [5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1],
        [6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1],
        [3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1],
        [6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1],
        [5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1],
        [1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
        [10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1],
        [6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1],
        [8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1],
        [7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1],
        [3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
        [5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1],
        [0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1],
        [9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1],
        [8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1],
        [5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1],
        [0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1],
        [6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1],
        [10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1],
        [10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1],
        [8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1],
        [1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
        [3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1],
        [0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1],
        [10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1],
        [3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1],
        [6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1],
        [9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1],
        [8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1],
        [3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1],
        [6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1],
        [0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1],
        [10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1],
        [10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1],
        [2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1],
        [7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1],
        [7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1],
        [2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1],
        [1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1],
        [11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1],
        [8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1],
        [0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1],
        [7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
        [10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
        [2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
        [6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1],
        [7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1],
        [2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
        [1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1],
        [10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1],
        [10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1],
        [0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1],
        [7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1],
        [6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1],
        [8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1],
        [9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1],
        [6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1],
        [4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1],
        [10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1],
        [8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1],
        [0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1],
        [1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
        [8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1],
        [10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1],
        [4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1],
        [10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
        [5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
        [11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1],
        [9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
        [6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1],
        [7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1],
        [3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1],
        [7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1],
        [9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1],
        [3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1],
        [6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1],
        [9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1],
        [1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1],
        [4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1],
        [7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1],
        [6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1],
        [3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1],
        [0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1],
        [6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1],
        [0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1],
        [11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1],
        [6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1],
        [5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1],
        [9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1],
        [1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1],
        [1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1],
        [10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1],
        [0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1],
        [5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1],
        [10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1],
        [11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1],
        [9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1],
        [7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1],
        [2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1],
        [8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1],
        [9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1],
        [9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1],
        [1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
        [9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1],
        [9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1],
        [5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1],
        [0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1],
        [10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1],
        [2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1],
        [0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1],
        [0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1],
        [9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1],
        [5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1],
        [3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1],
        [5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1],
        [8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1],
        [0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1],
        [9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1],
        [0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1],
        [1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1],
        [3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1],
        [4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1],
        [9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1],
        [11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1],
        [11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1],
        [2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1],
        [9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1],
        [3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1],
        [1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1],
        [4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1],
        [4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1],
        [0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
        [3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1],
        [3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1],
        [0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1],
        [9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1],
        [1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]];
    this.grid = new Array(0);
    this.len = 0;                   //搜索半径
    this.minX = 0;
    this.maxX=0;
    this.minY=0;
    this.maxY=0;
    this.minZ=0;
    this.maxZ=0;
    this.xNum=0;
    this.yNum=0;
    this.zNum=0;

    this.mass=0;
    this.viscosity=0;
    this.stiff=0;
    this.searchRadius=0;         //搜索半径
    this.numParticle=0;


    //marching cubes提取等值面
    this.isoRadius=0;
    this.mcStride=0;

    this.posVolume = new THREE.Vector3(0,0,0);               //起始位置
    this.isoValue = new Array(0);
    this.isoNormal = new Array(0);
    this.xWidth=0;
    this.yWidth=0;
    this.zWidth=0;       //用于提取等值面的剖分维度

    this.posX = new Array(NP);
    this.posCur = new Array(NP);
    this.vel = new Array(NP);
    this.vel_half = new Array(NP);
    this.acc = new Array(NP);
    this.normal = new Array(NP);
    this.density = new Array(NP);
    this.pressure = new Array(NP);
    this.neighbourList = new Array(NP);
    for(i =0;i<NP;i++)
    {
        this.posX[i] = new THREE.Vector3(0,0,0);
        this.posCur[i] = new THREE.Vector3(0,0,0);
        this.vel[i] = new THREE.Vector3(0,0,0);
        this.vel_half[i] = new THREE.Vector3(0,0,0);
        this.acc[i] = new THREE.Vector3(0,0,0);
        this.normal[i] = new THREE.Vector3(0,0,0);
        this.density[i] = 0.0;
        this.pressure[i] = 0.0;
        this.neighbourList[i] = new Array(0);
    }

    //核常量
    this.poly6_coef = 0;
    this.lap_poly6_coef = 0;
    this.grad_poly6_coef = 0;
    this.grad_spiky_coef = 0;
    this.lap_vis_coef = 0;

    this.mat = new THREE.Matrix4();
    this.mat_inv = new THREE.Matrix4();

}
Object.assign(Body.prototype, {

        isBody: true,

        initialize: function (num, vis, stif, radius, pos) {
            this.mass = 0.00020543;
            this.viscosity = vis;
            this.stiff = stif;
            this.len = this.searchRadius = radius;
            this.isoRadius = 0.0125;
            this.mcStride = 0.005;
            this.numParticle = num;

            for(i =0;i<num;i++)
            {
                this.posX[i] = new THREE.Vector3(pos[i].x,pos[i].y,pos[i].z);
                this.posCur[i] = new THREE.Vector3(pos[i].x,pos[i].y,pos[i].z);
            }

            for (i = 0; i < this.numParticle; i++) {
                this.vel[i] = new THREE.Vector3(0,0,0);
                this.vel_half[i] = new THREE.Vector3(0,0,0);
                this.acc[i] = new THREE.Vector3(0,0,0);
            }
            this.poly6_coef = 315.0 / (64.0 * PI * Math.pow(this.len, 9));
            this.grad_poly6_coef = 945.0 / (32.0 * PI * Math.pow(this.len, 9));
            this.lap_poly6_coef = 945.0 / (32.0 * PI * Math.pow(this.len, 9));
            this.grad_spiky_coef = -45.0 / (PI * this.len * this.len * this.len * this.len * this.len * this.len);
            this.lap_vis_coef = 45.0 / (PI * this.len * this.len * this.len * this.len * this.len * this.len);

            this.mat.identity();
            var temp = new THREE.Matrix4();
            temp.setPosition(new THREE.Vector3(0,0,0));
            this.mat.multiply(temp);
            this.mat_inv.getInverse(this.mat);
        },

        findNeighbous: function () {
            //对粒子集合的包围盒进行一致剖分
            this.minX = this.posCur[0].x;
            this.maxX = this.posCur[0].x;
            this.minY = this.posCur[0].y;
            this.maxY = this.posCur[0].y;
            this.minZ = this.posCur[0].z;
            this.maxZ = this.posCur[0].z;
            for (i = 0; i < this.numParticle; i++) {
                if (this.posCur[i].x < this.minX)
                    this.minX = this.posCur[i].x;
                if (this.posCur[i].x > this.maxX)
                    this.maxX = this.posCur[i].x;

                if (this.posCur[i].y < this.minY)
                    this.minY = this.posCur[i].y;
                if (this.posCur[i].y > this.maxY)
                    this.maxY = this.posCur[i].y;

                if (this.posCur[i].z < this.minZ)
                    this.minZ = this.posCur[i].z;
                if (this.posCur[i].z > this.maxZ)
                    this.maxZ = this.posCur[i].z;
            }
            this.xNum = Math.floor((this.maxX - this.minX) / this.len) + 1;
            this.yNum = Math.floor((this.maxY - this.minY) / this.len) + 1;
            this.zNum = Math.floor((this.maxZ - this.minZ) / this.len) + 1;

            this.grid = new Array(this.xNum * this.yNum * this.zNum);
            for(i = 0;i<this.xNum * this.yNum * this.zNum;i++)
            {
                this.grid[i] = new Array(0);
            }

            for (i = 0; i < this.numParticle; i++) {
                var xIndex = Math.floor((this.posCur[i].x - this.minX) / this.len);
                var yIndex = Math.floor((this.posCur[i].y - this.minY) / this.len);
                var zIndex = Math.floor((this.posCur[i].z - this.minZ) / this.len);
                var index = zIndex * this.xNum * this.yNum + yIndex * this.xNum + xIndex;
                this.grid[index].push(i);
            }
            //搜索每个粒子的邻居
            for (i = 0; i < this.numParticle; i++) {
                this.neighbourList[i] = new Array(0);

                xIndex = Math.floor((this.posCur[i].x - this.minX) / this.len); //所在格子索引
                yIndex = Math.floor((this.posCur[i].y - this.minY) / this.len);
                zIndex = Math.floor((this.posCur[i].z - this.minZ) / this.len);

                for (z = -1; z <= 1; z++)           //判断邻居格子的每个粒子
                {
                    for (y = -1; y <= 1; y++) {
                        for (x = -1; x <= 1; x++) {
                            index = Math.floor((zIndex + z) * this.xNum * this.yNum + (yIndex + y) * this.xNum + xIndex + x);
                            if (index < 0 || index >= this.xNum * this.yNum * this.zNum)
                                continue;
                            for (j = 0; j < this.grid[index].length; j++) {
                                var next = this.grid[index][j];
                                var temp = new THREE.Vector3(this.posCur[next].x - this.posCur[i].x, this.posCur[next].y - this.posCur[i].y, this.posCur[next].z - this.posCur[i].z);
                                if (temp.length() < this.len)                     //如果距离小于搜索半径，是邻居
                                {
                                    var neibourTemp = new Neighbour(next, temp.length());
                                    this.neighbourList[i].push(neibourTemp);
                                }
                            }
                        }
                    }
                }
            }
        },
        computeDensity: function () {
            for (i = 0; i < this.numParticle; i++) {
                this.density[i] = 0.0;
            }

            for (i = 0; i < this.numParticle; i++) {
                for (j = 0; j < this.neighbourList[i].length; j++) {
                    var neighbourIndex = this.neighbourList[i][j].index;
                    var distance = this.neighbourList[i][j].distance;
                    var h2 = this.len * this.len;
                    var r2 = distance * distance;
                    if (h2 > r2) {
                        this.density[i] += (h2 - r2) * (h2 - r2) * (h2 - r2) * this.mass;
                    }
                }
            }
            for (i = 0; i < this.numParticle; i++) {
                this.density[i] *= this.poly6_coef;
                this.pressure[i] = this.stiff * (this.density[i] - 1000.0);
                this.density[i] = 1.0 / this.density[i];
            }
        },

        createImplicitIso: function () {
            var stride = 0.005;
            var inv_stride = 1.0 / stride;
            var stride2 = stride * stride;
            var mcRange = 2;
            var k = this.mass * 315.0 / (64.0 * PI * Math.pow(this.isoRadius, 9));

            var posVolume = new THREE.Vector3(this.minX - mcRange * stride, this.minY - mcRange * stride, this.minZ - mcRange * stride);

            this.xWidth = Math.floor(this.maxX - this.minX) * inv_stride + mcRange * 2 + 1;
            this.yWidth = Math.floor(this.maxY - this.minY) * inv_stride + mcRange * 2 + 1;
            this.zWidth = Math.floor(this.maxZ - this.minZ) * inv_stride + mcRange * 2 + 1;

            this.isoValue = new Array(this.xWidth * this.yWidth * this.zWidth);
            this.isoNormal = new Array(this.xWidth * this.yWidth * this.zWidth);         //Vector3f *

            for (i = 0; i < this.xWidth * this.yWidth * this.zWidth; i++) {
                this.isoValue[i] = 0.0;
            }

            for (i = 0; i < this.xWidth * this.yWidth * this.zWidth; i++) {
                this.isoNormal[i] = new THREE.Vector3(0, 0, 0);
            }

            for (i = 0; i < this.numParticle; i++) {
                var p = new THREE.Vector3((this.posCur[i].x - this.posVolume.x) * inv_stride, (this.posCur[i].y - this.posVolume.y) * inv_stride, (this.posCur[i].z - this.posVolume.z) * inv_stride);
                for (z = -mcRange; z <= mcRange; z++) {
                    for (y = -mcRange; y <= mcRange; y++) {
                        for (x = -mcRange; x <= mcRange; x++) {
                            var vIndex;
                            var v;
                            var h2_r2;
                            var dx, dy, dz;
                            dx = Math.floor(p.x) * stride + this.posVolume.x - this.posCur[i].x + stride * x;//以该点为原点，各邻居网格顶点为终点的向量
                            dy = Math.floor(p.y) * stride + this.posVolume.y - this.posCur[i].y + stride * y;
                            dz = Math.floor(p.z) * stride + this.posVolume.z - this.posCur[i].z + stride * z;

                            h2_r2 = Math.max(this.isoRadius * this.isoRadius - (dx * dx + dy * dy + dz * dz), 0.0);

                            v = k * h2_r2 * h2_r2 * h2_r2;

                            vIndex = Math.floor(p.x + x )
                                + (Math.floor(p.y + y )) * this.xWidth
                                + (Math.floor(p.z + z )) * this.xWidth * this.yWidth;

                            if ((vIndex < 0) || (vIndex > this.xWidth * this.yWidth * this.zWidth))
                                continue;

                            this.isoValue[vIndex] += v;

                        }
                    }
                }
            }
        },
        renderIsoSurface: function (scene) {

            var pos = new Array(8);         //Vector3f *
            var normal = new Array(8);      //Vector3f *
            var value = new Array(8);
            var threshhold = 600.0;

            for(i = 0;i<8;i++)
            {
                pos[i] = new THREE.Vector3(0,0,0);
                normal[i] = new THREE.Vector3(0,0,0);
            }

            var vertlist = new Array(12);   //Vector3f *
            var normalList = new Array(12); //Vector3f *
            for(i = 0;i<12;i++)
            {
                vertlist[i] = new THREE.Vector3(0,0,0);
                normalList[i] = new THREE.Vector3(0,0,0);
            }



            for (z = 1; z < this.zWidth - 3; z++) {
                for (y = 1; y < this.yWidth - 3; y++) {
                    for (x = 1; x < this.xWidth - 3; x++) {
                        var cubeIndex = 0;
                        var edgeFlags = 0;
                        var base;
                        pos[0] = THREE.Vector3(this.posVolume.x + x * this.mcStride, this.posVolume.y + y * this.mcStride, this.posVolume.z + z * this.mcStride);
                        base = z * this.xWidth * this.yWidth + y * this.xWidth + x;
                        value[0] = this.isoValue[base];
                        normal[0].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[0].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[0].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[1] = THREE.Vector3(this.posVolume.x + x * this.mcStride, this.posVolume.y + (y + 1) * this.mcStride, this.posVolume.z + z * this.mcStride);
                        base = z * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x;
                        value[1] = this.isoValue[z * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x];
                        normal[1].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[1].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[1].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[2] = THREE.Vector3(this.posVolume.x + (x + 1) * this.mcStride, this.posVolume.y + (y + 1) * this.mcStride, this.posVolume.z + z * this.mcStride);
                        base = z * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x + 1;
                        value[2] = this.isoValue[z * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x + 1];
                        normal[2].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[2].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[2].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[3] = THREE.Vector3(this.posVolume.x + (x + 1) * this.mcStride, this.posVolume.y + y * this.mcStride, this.posVolume.z + z * this.mcStride);
                        base = z * this.xWidth * this.yWidth + y * this.xWidth + x + 1;
                        value[3] = this.isoValue[z * this.xWidth * this.yWidth + y * this.xWidth + x + 1];
                        normal[3].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[3].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[3].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[4] = THREE.Vector3(this.posVolume.x + x * this.mcStride, this.posVolume.y + y * this.mcStride, this.posVolume.z + (z + 1) * this.mcStride);
                        base = (z + 1) * this.xWidth * this.yWidth + y * this.xWidth + x;
                        value[4] = this.isoValue[(z + 1) * this.xWidth * this.yWidth + y * this.xWidth + x];
                        normal[4].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[4].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[4].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[5] = THREE.Vector3(this.posVolume.x + x * this.mcStride, this.posVolume.y + (y + 1) * this.mcStride, this.posVolume.z + (z + 1) * this.mcStride);
                        base = (z + 1) * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x;
                        value[5] = this.isoValue[(z + 1) * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x];
                        normal[5].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[5].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[5].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[6] = THREE.Vector3(this.posVolume.x + (x + 1) * this.mcStride, this.posVolume.y + (y + 1) * this.mcStride, this.posVolume.z + (z + 1) * this.mcStride);
                        base = (z + 1) * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x + 1;
                        value[6] = this.isoValue[(z + 1) * this.xWidth * this.yWidth + (y + 1) * this.xWidth + x + 1];
                        normal[6].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[6].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[6].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        pos[7] = THREE.Vector3(this.posVolume.x + (x + 1) * this.mcStride, this.posVolume.y + y * this.mcStride, this.posVolume.z + (z + 1) * this.mcStride);
                        base = (z + 1) * this.xWidth * this.yWidth + y * this.xWidth + x + 1;
                        value[7] = this.isoValue[(z + 1) * this.xWidth * this.yWidth + y * this.xWidth + x + 1];
                        normal[7].x = -(this.isoValue[base + 1] - this.isoValue[base - 1]);
                        normal[7].y = -(this.isoValue[base + this.xWidth] - this.isoValue[base - this.xWidth]);
                        normal[7].z = -(this.isoValue[base + this.xWidth * this.yWidth] - this.isoValue[base - this.xWidth * this.yWidth]);

                        if (value[0] < threshhold)
                            cubeIndex |= 1;
                        if (value[1] < threshhold)
                            cubeIndex |= 2;
                        if (value[2] < threshhold)
                            cubeIndex |= 4;
                        if (value[3] < threshhold)
                            cubeIndex |= 8;
                        if (value[4] < threshhold)
                            cubeIndex |= 16;
                        if (value[5] < threshhold)
                            cubeIndex |= 32;
                        if (value[6] < threshhold)
                            cubeIndex |= 64;
                        if (value[7] < threshhold)
                            cubeIndex |= 128;

                        edgeFlags = this.edgeTable[cubeIndex];

                        if (edgeFlags === 0)
                            continue;

                        if (edgeFlags % 2 === 1)
                            lerp_vertex(vertlist[0], normalList[0], pos[0], pos[1], value[0], value[1], normal[0], normal[1], threshhold);

                        if ((edgeFlags / 2) % 2 === 1)
                            lerp_vertex(vertlist[1], normalList[1], pos[1], pos[2], value[1], value[2], normal[1], normal[2], threshhold);

                        if ((edgeFlags / 4) % 2 === 1)
                            lerp_vertex(vertlist[2], normalList[2], pos[2], pos[3], value[2], value[3], normal[2], normal[3], threshhold);

                        if ((edgeFlags / 8) % 2 === 1)
                            lerp_vertex(vertlist[3], normalList[3], pos[3], pos[0], value[3], value[0], normal[3], normal[0], threshhold);

                        if ((edgeFlags / 16) % 2 === 1)
                            lerp_vertex(vertlist[4], normalList[4], pos[4], pos[5], value[4], value[5], normal[4], normal[5], threshhold);

                        if ((edgeFlags / 32) % 2 === 1)
                            lerp_vertex(vertlist[5], normalList[5], pos[5], pos[6], value[5], value[6], normal[5], normal[6], threshhold);

                        if ((edgeFlags / 64) % 2 === 1)
                            lerp_vertex(vertlist[6], normalList[6], pos[6], pos[7], value[6], value[7], normal[6], normal[7], threshhold);

                        if ((edgeFlags / 128) % 2 === 1)
                            lerp_vertex(vertlist[7], normalList[7], pos[7], pos[4], value[7], value[4], normal[7], normal[4], threshhold);

                        if ((edgeFlags / 256) % 2 === 1)
                            lerp_vertex(vertlist[8], normalList[8], pos[0], pos[4], value[0], value[4], normal[0], normal[4], threshhold);

                        if ((edgeFlags / 512) % 2 === 1)
                            lerp_vertex(vertlist[9], normalList[9], pos[1], pos[5], value[1], value[5], normal[1], normal[5], threshhold);

                        if ((edgeFlags / 1024) % 2 === 1)
                            lerp_vertex(vertlist[10], normalList[10], pos[2], pos[6], value[2], value[6], normal[2], normal[6], threshhold);

                        if ((edgeFlags / 2048) % 2 === 1)
                            lerp_vertex(vertlist[11], normalList[11], pos[3], pos[7], value[3], value[7], normal[3], normal[7], threshhold);

                        for (i = 0; this.triTable[cubeIndex][i] !== -1; i += 3) {

                            var mytri1 = new THREE.Geometry();
                            var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );

                            var color1 = new THREE.Color( 0xffffff );
                            var x = new THREE.Vector3(vertlist[this.triTable[cubeIndex][i]].x,vertlist[this.triTable[cubeIndex][i]].y,vertlist[this.triTable[cubeIndex][i]].z);
                            var x_normal = new THREE.Vector3(normalList[this.triTable[cubeIndex][i]].x,normalList[this.triTable[cubeIndex][i]].y,normalList[this.triTable[cubeIndex][i]].z);
                            var x_arrow = new THREE.ArrowHelper(x_normal,x,20,0x3333ff);

                            var y = new THREE.Vector3(vertlist[this.triTable[cubeIndex][i+2]].x,vertlist[this.triTable[cubeIndex][i+2]].y,vertlist[this.triTable[cubeIndex][i+2]].z);
                            var y_normal = new THREE.Vector3(normalList[this.triTable[cubeIndex][i+2]].x,normalList[this.triTable[cubeIndex][i+2]].y,normalList[this.triTable[cubeIndex][i+2]].z);
                            var y_arrow = new THREE.ArrowHelper(y_normal,y,20,0x3333ff);

                            var z = new THREE.Vector3(vertlist[this.triTable[cubeIndex][i+1]].x,vertlist[this.triTable[cubeIndex][i+1]].y,vertlist[this.triTable[cubeIndex][i+1]].z);
                            var z_normal = new THREE.Vector3(normalList[this.triTable[cubeIndex][i+1]].x,normalList[this.triTable[cubeIndex][i+1]].y,normalList[this.triTable[cubeIndex][i+1]].z);
                            var z_arrow = new THREE.ArrowHelper(z_normal,z,20,0x3333ff);

                            mytri1.vertices.push(x_arrow);
                            mytri1.vertices.push(y_arrow);
                            mytri1.vertices.push(z_arrow);
                            mytri1.colors.push(color1,color1,color1);
                            var triangle = new THREE.Mesh( mytri1, material);
                            scene.add(triangle);
                        }
                    }
                }
            }
        },
        computeForce: function () {
            for (i = 0; i < this.numParticle; i++) {
                this.acc[i] = new THREE.Vector3(0,0,0);
            }
            for (i = 0; i < this.numParticle; i++) {
                for (j = 0; j < this.neighbourList[i].length; j++) {
                    var index = Math.floor(this.neighbourList[i][j].index);
                    if (index !== i) {
                        if (this.len > this.neighbourList[i][j].distance) {
                            var h_r = this.len - this.neighbourList[i][j].distance;
                            var diff = new THREE.Vector3(this.posCur[i].x - this.posCur[index].x, this.posCur[i].y - this.posCur[index].y, this.posCur[i].z - this.posCur[index].z);

                            var scale = -0.5 * (this.pressure[i] + this.pressure[index]) * this.grad_spiky_coef * h_r / this.neighbourList[i][j].distance;
                            var force = new THREE.Vector3(0,0,0);
                            force.addScaledVector(diff, scale);              //压力

                            var vdiff = new THREE.Vector3(this.vel[index].x - this.vel[i].x, this.vel[index].y - this.vel[i].y, this.vel[index].z - this.vel[i].z);
                            var vscale = this.viscosity * this.lap_vis_coef;
                            vdiff.multiplyScalar(vscale);                         //粘性力
                            this.avscale = vscale;

                            force.add(vdiff);//合力
                            force.multiplyScalar(h_r * 0.001 * this.density[index]);  //  原来设置force *=(h_r*density[i]*density[index]);

                            this.acc[i].addScaledVector(force,this.mass);

                        }
                    }
                }
            }
        },
        compute_col: function (col, vel, n, diff, stiff, damp) {
            var v0;
            var reverse;
            v0 = n.dot(vel);//求内积
            reverse = stiff * diff - damp * v0;

            col.addScaledVector(n,reverse);
        },
        glassCollision: function (p, col, vel, mat, mat_inv, radius, stiff, damp) {
            var GLASS_R = 0.08;
            var GLASS_BOTTOM = -0.1;
            var GLASS_TOP = 10.22;

            var p_col = new THREE.Vector3(0, 0, 0);
            var n = new THREE.Vector3(0, 0, 0);
            var diff;

            p_col = p.applyMatrix4(mat_inv);

            diff = 2.0 * radius - (GLASS_R - Math.sqrt(p_col.x * p_col.x + p_col.z * p_col.z));

            if (((diff < 8.0 * radius) && (diff > 0.00001)) && (p_col.y < GLASS_TOP)) {
                n.x = -p_col.x;
                n.z = -p_col.z;
                n.y = 0.0;
                n.normalize();
                n = n.transformDirection(mat);
                this.compute_col(col, vel, n, diff, stiff, damp);             //根据diff计算col
            }

            diff = 2.0 * radius - (p_col.y - GLASS_BOTTOM);

            if (diff > 0.00001) {
                n = new THREE.Vector3(0.0, 1.0, 0.0);
                n = n.transformDirection(mat);
                this.compute_col(col, vel, n, diff, stiff, damp);
            }
        },
        collisionProcess: function () {
            var sphere_radius = 0.006;
            var stiff = 30000.0;
            var damp = 128.0;

            var pre_p = new THREE.Vector3(0, 0, 0);
            var col;

            for (i = 0; i < this.numParticle; i++) {
                col = new THREE.Vector3(0, 0, 0);
                pre_p = Vector3Add(this.posCur[i], Vector3Mul(this.vel_half[i], 0.003));
                this.glassCollision(pre_p, col, this.vel[i], this.mat, this.mat_inv, sphere_radius, stiff, damp);
                this.acc[i].add(col);
            }
        },
        update: function () {
            var timeStep = 0.003;
            var gravity = new THREE.Vector3(0.0, -9.8, 0.0);
            for (i = 0; i < this.numParticle; i++) {
                var finalAcc = Vector3Add(this.acc[i], gravity);

                var scaledAcc = Vector3Mul(finalAcc, timeStep);
                var vhalf = Vector3Add(this.vel_half[i], scaledAcc);

                var scaledVhalf = Vector3Mul(vhalf, timeStep);
                this.posCur[i].add(scaledVhalf);

                this.vel[i] = Vector3Add(this.vel_half[i], vhalf);
                this.vel[i] = Vector3Mul(this.vel[i], 0.5);
                this.vel_half[i] = vhalf;

            }
        },
        getposCur: function(returnValue){
            for(i =0;i<this.numParticle;i++)
            {
                returnValue.push(new THREE.Vector3(this.posCur[i].x,this.posCur[i].y,this.posCur[i].z));
            }
        }
    }
);
