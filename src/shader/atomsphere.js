import {
    Color,
    NearestFilter,
    ShaderMaterial,
    RawShaderMaterial,
    UniformsUtils,
    WebGLRenderTarget,
    Vector3,
    Vector2,
} from 'three';
import {Pass} from 'three/examples/jsm/postprocessing/Pass';
import atmosphereVertexShader from '../shader/atmosphere.vert'
import atmosphereFragmentShader from '../shader/atmosphere.frag'
import depthVertexShader from '../shader/depth.vert'
import depthFragmentShader from '../shader/depth.frag'

/**
 * Depth-of-field post-process with bokeh shader
 */

class AtmospherePass extends Pass {

    constructor(scene, camera, planets) {

        super();

        this.scene = scene;
        this.camera = camera;
        this.planets = planets;

        // render targets

        const width = window.innerWidth
        const height = window.innerHeight

        this.renderTargetDepth = new WebGLRenderTarget(width, height, {
            minFilter: NearestFilter,
            magFilter: NearestFilter
        });

        this.renderTargetDepth.texture.name = 'AtmospherePass.depth';

        // depth material
        const depthShader = {
            uniforms: {
                'cameraPosition': {value: camera.position},
            },
            vertexShader: depthVertexShader,
            fragmentShader: depthFragmentShader,
        }

        this.materialDepth = new RawShaderMaterial({
            uniforms: depthShader.uniforms,
            vertexShader: depthShader.vertexShader,
            fragmentShader: depthShader.fragmentShader
        });

        // atmosphere material
        const planetsInfo = planets.getPlanetsInfo()

        const atmosphereShader = {
            defines: {
                'DEPTH_PACKING': 1,
                'PERSPECTIVE_CAMERA': 1,
                'PLANET_COUNT': planetsInfo.length,
            },
            uniforms: {
                'tColor': {value: null},
                'tDepth': {value: null},
                'planets': {value: null},
                'aspect': {value: 1.0},
                'focal': {value: 1.0},
                'filmSize': {value: new Vector2()},
                'nearClip': {value: 1.0},
                'farClip': {value: 1000.0},
                'cameraPosition': {value: new Vector3()},
                'cameraFront': {value: new Vector3(0.0, 0.0, -1.0)},
                'cameraUp': {value: new Vector3(0.0, 1.0, 0.0)},
            },
            vertexShader: atmosphereVertexShader,
            fragmentShader: atmosphereFragmentShader,
        }

        const atmosphereUniforms = UniformsUtils.clone(atmosphereShader.uniforms);

        atmosphereUniforms['tDepth'].value = this.renderTargetDepth.texture;

        atmosphereUniforms['nearClip'].value = camera.near;
        atmosphereUniforms['farClip'].value = camera.far;
        atmosphereUniforms['aspect'].value = camera.aspect;
        atmosphereUniforms['focal'].value = camera.getFocalLength();
        atmosphereUniforms['filmSize'].value.set(camera.getFilmWidth(), camera.getFilmHeight());
        atmosphereUniforms['cameraPosition'].value = camera.position;
        atmosphereUniforms['cameraUp'].value.applyQuaternion(camera.quaternion).normalize()
        atmosphereUniforms['cameraFront'].value.applyQuaternion(camera.quaternion).normalize()
        atmosphereUniforms['planets'].value = planetsInfo

        this.materialAtmosphere = new ShaderMaterial({
            defines: Object.assign({}, atmosphereShader.defines),
            uniforms: atmosphereUniforms,
            vertexShader: atmosphereShader.vertexShader,
            fragmentShader: atmosphereShader.fragmentShader
        });

        this.uniforms = atmosphereUniforms;
        this.needsSwap = false;

        this.fsQuad = new Pass.FullScreenQuad(this.materialAtmosphere);

        this._oldClearColor = new Color();

    }

    render(renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/) {

        // Render depth into texture

        this.scene.overrideMaterial = this.materialDepth;

        renderer.getClearColor(this._oldClearColor);
        const oldClearAlpha = renderer.getClearAlpha();
        const oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;

        renderer.setClearColor(0xffffff);
        renderer.setClearAlpha(1.0);
        renderer.setRenderTarget(this.renderTargetDepth);
        renderer.clear();
        renderer.render(this.scene, this.camera);

        // Render atmosphere composite

        this.uniforms['tColor'].value = readBuffer.texture;
        this.uniforms['nearClip'].value = this.camera.near;
        this.uniforms['farClip'].value = this.camera.far;
        this.uniforms['focal'].value = this.camera.getFocalLength();
        this.uniforms['filmSize'].value.set(this.camera.getFilmWidth(), this.camera.getFilmHeight());
        this.uniforms['focal'].value = this.camera.getFocalLength();
        this.uniforms['cameraPosition'].value = this.camera.position;
        this.uniforms['cameraUp'].value.set(0.0, 1.0, 0.0)
        this.uniforms['cameraFront'].value.set(0.0, 0.0, -1.0)
        this.uniforms['cameraUp'].value.applyQuaternion(this.camera.quaternion).normalize()
        this.uniforms['cameraFront'].value.applyQuaternion(this.camera.quaternion).normalize()
        this.uniforms['planets'].value = this.planets.getPlanetsInfo()

        if (this.renderToScreen) {

            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);

        } else {

            renderer.setRenderTarget(writeBuffer);
            renderer.clear();
            this.fsQuad.render(renderer);

        }

        this.scene.overrideMaterial = null;
        renderer.setClearColor(this._oldClearColor);
        renderer.setClearAlpha(oldClearAlpha);
        renderer.autoClear = oldAutoClear;


    }

}

export {AtmospherePass};
