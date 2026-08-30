import { useEffect, useRef } from 'react'

/* A slow-drifting smoke field on a fine dot weave — the hero backdrop.
   Raw WebGL1, no dependencies. Colours come from CSS custom properties so
   the field follows whatever palette is active. */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uDpr;
uniform vec3 uBase;
uniform vec3 uPlume;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

const mat2 ROT = mat2(1.62, 1.18, -1.18, 1.62);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = ROT * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y * 1.45;

  float t = uTime * 0.035;

  // Two rounds of domain warping: gives plumes that fold instead of slide.
  vec2 q = vec2(
    fbm(p + vec2(0.0, t)),
    fbm(p + vec2(4.3, -t * 0.72))
  );
  vec2 r = vec2(
    fbm(p + 1.75 * q + vec2(1.3, -0.4) + t * 0.30),
    fbm(p + 1.75 * q + vec2(8.9, 2.6) - t * 0.24)
  );
  float f = fbm(p + 2.15 * r + vec2(0.0, t * 0.15));

  // Light falls from the top, the way it does on a lit backdrop.
  float sky = smoothstep(-0.10, 1.30, uv.y);
  float light = f * 1.30 + sky * 0.22 - 0.58;
  light = clamp(light, 0.0, 1.0);

  // Crushed blacks, a long shoulder into the highlight.
  light = pow(light, 1.30);
  light += 0.80 * pow(light, 1.35) * smoothstep(0.10, 0.90, r.x + 0.35);
  light = clamp(light, 0.0, 1.0);

  vec3 col = mix(uBase, uPlume, light);

  // Fine dot weave — a print screen, strongest through the mid tones.
  vec2 sp = gl_FragCoord.xy / max(uDpr, 1.0);
  float weave = sin(sp.x * 3.14159265) * sin(sp.y * 3.14159265);
  col += weave * 0.030 * smoothstep(0.01, 0.28, light);

  // Vignette.
  vec2 vg = uv - 0.5;
  col *= 1.0 - 0.55 * dot(vg, vg) * 1.35;

  // Animated grain, so the field never reads as a flat gradient.
  float g = hash(gl_FragCoord.xy + fract(uTime * 0.71) * vec2(311.0, 137.0));
  col += (g - 0.5) * 0.026;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function readColor(el: Element, name: string, fallback: [number, number, number]) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim()
  const hex = raw.replace('#', '')
  if (hex.length === 6) {
    const n = Number.parseInt(hex, 16)
    if (!Number.isNaN(n)) {
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as [number, number, number]
    }
  }
  const rgb = raw.match(/[\d.]+/g)
  if (rgb && rgb.length >= 3) {
    return [Number(rgb[0]) / 255, Number(rgb[1]) / 255, Number(rgb[2]) / 255] as [number, number, number]
  }
  return fallback
}

export default function SmokeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) {
      canvas.parentElement?.classList.add('is-fallback')
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!vs || !fs || !program) {
      canvas.parentElement?.classList.add('is-fallback')
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.parentElement?.classList.add('is-fallback')
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uDpr = gl.getUniformLocation(program, 'uDpr')
    const uBase = gl.getUniformLocation(program, 'uBase')
    const uPlume = gl.getUniformLocation(program, 'uPlume')

    let dpr = 1

    const applyColors = () => {
      const host = canvas.parentElement ?? document.documentElement
      const base = readColor(host, '--smoke-base', [0.031, 0.031, 0.035])
      const plume = readColor(host, '--smoke-plume', [0.494, 0.502, 0.486])
      gl.uniform3fv(uBase, base)
      gl.uniform3fv(uPlume, plume)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(1, Math.round(rect.width * dpr))
      const h = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uDpr, dpr)
    }

    const draw = (t: number) => {
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    applyColors()
    resize()

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let start = performance.now()
    let visible = true

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      draw((now - start) / 1000 + 6)
    }

    const stop = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    const run = () => {
      stop()
      if (motionQuery.matches) {
        draw(14)
        return
      }
      start = performance.now()
      frame = requestAnimationFrame(loop)
    }

    run()

    const onResize = () => {
      resize()
      if (motionQuery.matches) draw(14)
    }
    window.addEventListener('resize', onResize)
    motionQuery.addEventListener('change', run)

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { rootMargin: '120px' },
    )
    observer.observe(canvas)

    const onVisibility = () => {
      if (!document.hidden && !motionQuery.matches) start = performance.now() - 6000
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      motionQuery.removeEventListener('change', run)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return (
    <div className="smoke" aria-hidden="true">
      <canvas ref={canvasRef} className="smoke-canvas" />
    </div>
  )
}
