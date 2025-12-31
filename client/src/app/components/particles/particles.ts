import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

@Component({
    selector: 'app-particles',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div #container class="particles-container"></div>
  `,
    styles: [`
    .particles-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      /* Ensure it fits in parent */
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticlesComponent implements OnInit, OnDestroy {
    @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

    @Input() particleCount = 200;
    @Input() particleSpread = 10;
    @Input() speed = 0.1;
    @Input() particleColors: string[] = ['#ffffff', '#ffffff', '#ffffff'];
    @Input() moveParticlesOnHover = false;
    @Input() particleHoverFactor = 1;
    @Input() alphaParticles = false;
    @Input() particleBaseSize = 100;
    @Input() sizeRandomness = 1;
    @Input() cameraDistance = 20;
    @Input() disableRotation = false;
    @Input() pixelRatio = 1; // Default to 1 implies checking window.devicePixelRatio later if not set

    private renderer: any;
    private gl: any;
    private camera: any;
    private program: any;
    private mesh: any;
    private animationId: number | null = null;
    private lastTime = 0;
    private elapsed = 0;
    private mouse = { x: 0, y: 0 };
    private destroyResizeListener?: () => void;
    private destroyMouseMoveListener?: () => void;

    constructor(private ngZone: NgZone) { }

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.initGL();
            this.animate(performance.now());
        });
    }

    ngOnDestroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.destroyResizeListener) {
            this.destroyResizeListener();
        }
        if (this.destroyMouseMoveListener) {
            this.destroyMouseMoveListener();
        }

        // Cleanup GL
        if (this.gl && this.renderer) {
            // OGL doesn't have a specific destroy method on renderer, but we can clear canvas
            const container = this.containerRef.nativeElement;
            if (container && this.gl.canvas && container.contains(this.gl.canvas)) {
                container.removeChild(this.gl.canvas);
            }
        }
    }

    private initGL() {
        const container = this.containerRef.nativeElement;

        this.renderer = new Renderer({
            dpr: this.pixelRatio || window.devicePixelRatio,
            depth: false,
            alpha: true,
        });

        this.gl = this.renderer.gl;
        this.gl.clearColor(0, 0, 0, 0); // Transparent background
        container.appendChild(this.gl.canvas);

        this.camera = new Camera(this.gl, { fov: 15 });
        this.camera.position.set(0, 0, this.cameraDistance);

        this.handleResize();
        const resizeListener = () => this.handleResize();
        window.addEventListener('resize', resizeListener, false);
        this.destroyResizeListener = () => window.removeEventListener('resize', resizeListener);

        if (this.moveParticlesOnHover) {
            const mouseMoveListener = (e: MouseEvent) => this.handleMouseMove(e);
            window.addEventListener('mousemove', mouseMoveListener, false); // Listen on window for broader hover effect or container? React code listed on container but then used window behavior probably.
            // React code: container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mousemove', mouseMoveListener);
            this.destroyMouseMoveListener = () => container.removeEventListener('mousemove', mouseMoveListener);
        }

        this.createParticles();
    }

    private handleResize() {
        const container = this.containerRef.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.renderer.setSize(width, height);
        this.camera.perspective({ aspect: this.gl.canvas.width / this.gl.canvas.height });
    }

    private handleMouseMove(e: MouseEvent) {
        const container = this.containerRef.nativeElement;
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        this.mouse = { x, y };
    }

    private createParticles() {
        const count = this.particleCount;
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count * 4);
        const colorsData = new Float32Array(count * 3); // Rename to not conflict with input
        const palette = this.particleColors.length > 0 ? this.particleColors : ['#ffffff', '#ffffff', '#ffffff'];

        for (let i = 0; i < count; i++) {
            let x, y, z, len;
            do {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                z = Math.random() * 2 - 1;
                len = x * x + y * y + z * z;
            } while (len > 1 || len === 0);

            const r = Math.cbrt(Math.random());
            positions.set([x * r, y * r, z * r], i * 3);
            randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);

            const hex = palette[Math.floor(Math.random() * palette.length)];
            const rgb = this.hexToRgb(hex);
            colorsData.set(rgb, i * 3);
        }

        const geometry = new Geometry(this.gl, {
            position: { size: 3, data: positions },
            random: { size: 4, data: randoms },
            color: { size: 3, data: colorsData }
        });

        const vertex = `
      attribute vec3 position;
      attribute vec4 random;
      attribute vec3 color;
      
      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;
      uniform float uTime;
      uniform float uSpread;
      uniform float uBaseSize;
      uniform float uSizeRandomness;
      
      varying vec4 vRandom;
      varying vec3 vColor;
      
      void main() {
        vRandom = random;
        vColor = color;
        
        vec3 pos = position * uSpread;
        pos.z *= 10.0;
        
        vec4 mPos = modelMatrix * vec4(pos, 1.0);
        float t = uTime;
        mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
        mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
        mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
        
        vec4 mvPos = viewMatrix * mPos;

        if (uSizeRandomness == 0.0) {
          gl_PointSize = uBaseSize;
        } else {
          gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
        }

        gl_Position = projectionMatrix * mvPos;
      }
    `;

        const fragment = `
      precision highp float;
      
      uniform float uTime;
      uniform float uAlphaParticles;
      varying vec4 vRandom;
      varying vec3 vColor;
      
      void main() {
        vec2 uv = gl_PointCoord.xy;
        float d = length(uv - vec2(0.5));
        
        if(uAlphaParticles < 0.5) {
          if(d > 0.5) {
            discard;
          }
          gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
        } else {
          float circle = smoothstep(0.5, 0.4, d) * 0.8;
          gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
        }
      }
    `;

        this.program = new Program(this.gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uSpread: { value: this.particleSpread },
                uBaseSize: { value: this.particleBaseSize * (this.pixelRatio || window.devicePixelRatio) },
                uSizeRandomness: { value: this.sizeRandomness },
                uAlphaParticles: { value: this.alphaParticles ? 1 : 0 }
            },
            transparent: true,
            depthTest: false
        });

        this.mesh = new Mesh(this.gl, { mode: this.gl.POINTS, geometry, program: this.program });
    }

    private animate(t: number) {
        this.animationId = requestAnimationFrame((time) => this.animate(time));

        if (!this.lastTime) this.lastTime = t;
        const delta = t - this.lastTime;
        this.lastTime = t;
        this.elapsed += delta * this.speed;

        this.program.uniforms.uTime.value = this.elapsed * 0.001;

        if (this.moveParticlesOnHover) {
            this.mesh.position.x = -this.mouse.x * this.particleHoverFactor;
            this.mesh.position.y = -this.mouse.y * this.particleHoverFactor;
        } else {
            this.mesh.position.x = 0;
            this.mesh.position.y = 0;
        }

        if (!this.disableRotation) {
            this.mesh.rotation.x = Math.sin(this.elapsed * 0.0002) * 0.1;
            this.mesh.rotation.y = Math.cos(this.elapsed * 0.0005) * 0.15;
            this.mesh.rotation.z += 0.01 * this.speed;
        }

        this.renderer.render({ scene: this.mesh, camera: this.camera });
    }

    private hexToRgb(hex: string): [number, number, number] {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const int = parseInt(hex, 16);
        const r = ((int >> 16) & 255) / 255;
        const g = ((int >> 8) & 255) / 255;
        const b = (int & 255) / 255;
        return [r, g, b];
    }
}
