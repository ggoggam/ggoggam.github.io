"use client"

import { set } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';

const NUM_BALLS = 5;

const vertexShaderSource = `
  attribute vec3 aPosition;
  uniform float width;
  uniform float height;
  varying highp vec2 vPos;

  void main() {
    float aspectRatio = width / height;
    vec3 scaledPosition = vec3(aPosition.x * aspectRatio, aPosition.y, aPosition.z);
    gl_Position = vec4(scaledPosition, 1.0);
    vPos = vec2(
      (gl_Position.x + 1.) / 2. * width,
      (gl_Position.y + 1.) / 2. * height
    );
  }
`;

const fragmentShaderSource = `
  precision highp float;
  #define BALLS ${NUM_BALLS}

  uniform float xs[BALLS];
  uniform float ys[BALLS];
  uniform float rs[BALLS];
  varying highp vec2 vPos;

  void main() {
    vec3 backgroundColor = vec3(0.976, 0.980, 0.984);
    float sum = 0.;
    for (int i = 0; i < BALLS; i++) {
      float dx = xs[i] - vPos.x;
      float dy = ys[i] - vPos.y;
      float d = length(vec2(dx, dy));
      sum += rs[i] / d;
    }
    if (sum > 11.) {
      gl_FragColor = vec4(vec3(0.), 1.);
    } else {
      gl_FragColor = vec4(backgroundColor, 1.);
    }
  }
`;

class Ball {
  position: { x: number; y: number; };
  velocity: { x: number; y: number; };
  radius: number;
  angle: number;

  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.position = { x, y };
    this.angle = Math.random() * 2 * Math.PI;
    const BASE_SPEED = 0.005;
    this.velocity = {
      x: BASE_SPEED * Math.cos(this.angle),
      y: BASE_SPEED * Math.sin(this.angle)
    };
    this.radius = 1000;
    this.width = width;
    this.height = height;
  }

  update(balls: Ball[]) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x < 0 || this.position.x > this.width) this.velocity.x *= -1;
    if (this.position.y < 0 || this.position.y > this.height) this.velocity.y *= -1;

    for (const ball of balls) {
      if (ball === this) continue;
      const dx = ball.position.x - this.position.x;
      const dy = ball.position.y - this.position.y;
      const d = Math.hypot(dx, dy);
      this.velocity.x += dx / (d * 200);
      this.velocity.y += dy / (d * 200);
    }
  }
}

const MetaballsAnimation = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationRef = useRef(null);
  const programRef = useRef(null);
  const ballsRef = useRef([]);

  const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const initWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;

    // Create vertex buffer
    const vertices = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Initialize balls
    ballsRef.current = Array(NUM_BALLS).fill(0).map(() => 
      new Ball(
        Math.random() * dimensions.width,
        Math.random() * dimensions.height,
        dimensions.width,
        dimensions.height
      )
    );

    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, 'width'), dimensions.width);
    gl.uniform1f(gl.getUniformLocation(program, 'height'), dimensions.height);
    gl.uniform1fv(
      gl.getUniformLocation(program, 'rs'),
      ballsRef.current.map((ball: Ball) => ball.radius)
    );``
  };

  const animate = () => {
    const gl = canvasRef.current.getContext('webgl');
    if (!gl || !programRef.current) return;

    gl.useProgram(programRef.current);

    // Update and draw
    ballsRef.current.forEach((ball: Ball) => ball.update(ballsRef.current));
    
    gl.uniform1fv(
      gl.getUniformLocation(programRef.current, 'xs'),
      ballsRef.current.map((ball: Ball) => ball.position.x)
    );
    gl.uniform1fv(
      gl.getUniformLocation(programRef.current, 'ys'),
      ballsRef.current.map((ball: Ball) => ball.position.y)
    );

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const updateDimensions = () => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;

      initWebGL();
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-screen absolute z-0 top-0 left-0"
    />
  );
};

export default MetaballsAnimation;