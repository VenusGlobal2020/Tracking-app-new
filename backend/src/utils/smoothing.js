// Simple Catmull-Rom spline interpolation to smooth GPS paths on the server if needed.
export function catmullRomSpline(points, segments = 8) {
  if (points.length < 4) return points;
  const result = [];
  for (let i=0; i<points.length-3; i++) {
    const p0 = points[i], p1 = points[i+1], p2 = points[i+2], p3 = points[i+3];
    for (let j=0; j<segments; j++) {
      const t = j/segments;
      const t2 = t*t;
      const t3 = t2*t;
      const x = 0.5*((2*p1[1]) + (-p0[1] + p2[1])*t + (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1])*t2 + (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1])*t3);
      const y = 0.5*((2*p1[0]) + (-p0[0] + p2[0])*t + (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0])*t2 + (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0])*t3);
      result.push([y, x]);
    }
  }
  result.push(points[points.length-2]);
  result.push(points[points.length-1]);
  return result;
}
