import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface WhiteKeyVideoHandle {
  play: () => Promise<void>
}

interface WhiteKeyVideoProps {
  src: string
  className: string
  onPlay: (duration: number) => void
  onEnded: () => void
  onError: (message: string) => void
}

const WhiteKeyVideo = forwardRef<WhiteKeyVideoHandle, WhiteKeyVideoProps>(
  function WhiteKeyVideo({ src, className, onPlay, onEnded, onError }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const callbacksRef = useRef({ onPlay, onEnded, onError })
    callbacksRef.current = { onPlay, onEnded, onError }

    useImperativeHandle(ref, () => ({
      play: () => {
        const video = videoRef.current
        if (!video) return Promise.reject(new Error('The ribbon video is unavailable.'))
        return video.play()
      },
    }), [])

    useEffect(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
      })
      if (!gl) {
        callbacksRef.current.onError('Transparent video is not supported in this browser.')
        return
      }

      const vertexShader = gl.createShader(gl.VERTEX_SHADER)
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
      const program = gl.createProgram()
      const buffer = gl.createBuffer()
      const texture = gl.createTexture()

      if (!vertexShader || !fragmentShader || !program || !buffer || !texture) {
        callbacksRef.current.onError('The ribbon animation could not be initialized.')
        return
      }

      gl.shaderSource(vertexShader, `
        attribute vec2 aPosition;
        varying vec2 vTexCoord;
        void main() {
          vTexCoord = vec2((aPosition.x + 1.0) * 0.5, 1.0 - (aPosition.y + 1.0) * 0.5);
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `)
      gl.shaderSource(fragmentShader, `
        precision mediump float;
        varying vec2 vTexCoord;
        uniform sampler2D uVideo;
        uniform float uSimilarity;
        uniform float uBlend;
        void main() {
          vec4 pixel = texture2D(uVideo, vTexCoord);
          float distanceFromWhite = length(vec3(1.0) - pixel.rgb) * 0.57735;
          float alpha = smoothstep(uSimilarity, uSimilarity + uBlend, distanceFromWhite);
          gl_FragColor = vec4(pixel.rgb, alpha);
        }
      `)
      gl.compileShader(vertexShader)
      gl.compileShader(fragmentShader)

      if (
        !gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) ||
        !gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)
      ) {
        callbacksRef.current.onError('The ribbon transparency effect could not be initialized.')
        return
      }

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        callbacksRef.current.onError('The ribbon transparency effect could not be initialized.')
        return
      }

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      )
      const position = gl.getAttribLocation(program, 'aPosition')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.uniform1i(gl.getUniformLocation(program, 'uVideo'), 0)
      gl.uniform1f(gl.getUniformLocation(program, 'uSimilarity'), 0.08)
      gl.uniform1f(gl.getUniformLocation(program, 'uBlend'), 0.16)
      gl.clearColor(0, 0, 0, 0)

      let animationFrame = 0
      let ready = false

      const renderFrame = () => {
        if (!ready || video.videoWidth === 0 || video.videoHeight === 0) return
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          gl.viewport(0, 0, canvas.width, canvas.height)
        }
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }

      const renderWhilePlaying = () => {
        renderFrame()
        if (!video.paused && !video.ended) {
          animationFrame = requestAnimationFrame(renderWhilePlaying)
        }
      }
      const handleLoadedData = () => {
        ready = true
        renderFrame()
      }
      const handlePlaying = () => {
        callbacksRef.current.onPlay(video.duration)
        animationFrame = requestAnimationFrame(renderWhilePlaying)
      }
      const handlePause = () => cancelAnimationFrame(animationFrame)
      const handleEnded = () => {
        cancelAnimationFrame(animationFrame)
        renderFrame()
        callbacksRef.current.onEnded()
      }
      const handleError = () => {
        callbacksRef.current.onError('The ribbon animation could not be loaded.')
      }

      video.addEventListener('loadeddata', handleLoadedData)
      video.addEventListener('playing', handlePlaying)
      video.addEventListener('pause', handlePause)
      video.addEventListener('ended', handleEnded)
      video.addEventListener('error', handleError)
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) handleLoadedData()

      return () => {
        cancelAnimationFrame(animationFrame)
        video.removeEventListener('loadeddata', handleLoadedData)
        video.removeEventListener('playing', handlePlaying)
        video.removeEventListener('pause', handlePause)
        video.removeEventListener('ended', handleEnded)
        video.removeEventListener('error', handleError)
        gl.deleteTexture(texture)
        gl.deleteBuffer(buffer)
        gl.deleteProgram(program)
        gl.deleteShader(vertexShader)
        gl.deleteShader(fragmentShader)
      }
    }, [src])

    return (
      <>
        <canvas ref={canvasRef} className={className} aria-hidden="true" />
        <video
          ref={videoRef}
          className="pointer-events-none fixed h-px w-px opacity-0"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          src={src}
        />
      </>
    )
  },
)

export default WhiteKeyVideo
