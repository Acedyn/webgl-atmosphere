import {
    Color,
    MeshDepthMaterial,
    NearestFilter,
    NoBlending,
    RGBADepthPacking,
    ShaderMaterial,
    UniformsUtils,
    WebGLRenderTarget,
    Vector3,
    Matrix4,
} from 'three';
import {Pass} from 'three/examples/jsm/postprocessing/Pass';
import atmosphereVertexShader from '../shader/atmosphere.vert'
import atmosphereFragmentShader from '../shader/atmosphere.frag'

/**
 * Depth-of-field post-process with bokeh shader
 */

class AtmospherePass extends Pass {

    constructor(scene, camera, params) {

        super();

        this.scene = scene;
        this.camera = camera;

        // render targets

        const width = window.innerWidth
        const height = window.innerHeight

        this.renderTargetDepth = new WebGLRenderTarget(width, height, {
            minFilter: NearestFilter,
            magFilter: NearestFilter
        });

        this.renderTargetDepth.texture.name = 'BokehPass.depth';

        // depth material

        this.materialDepth = new MeshDepthMaterial();
        this.materialDepth.depthPacking = RGBADepthPacking;
        this.materialDepth.blending = NoBlending;

        // atmosphere material

        const atmosphereShader = {
            defines: {
                'DEPTH_PACKING': 1,
                'PERSPECTIVE_CAMERA': 1,
            },
            uniforms: {
                'tColor': {value: null},
                'tDepth': {value: null},
                'aspect': {value: 1.0},
                'focal': {value: 1.0},
                'filmWidth': {value: 1.0},
                'filmHeight': {value: 1.0},
                'nearClip': {value: 1.0},
                'farClip': {value: 1000.0},
                'cameraPosition': {value: new Vector3()},
                'cameraFront': {value: new Vector3(0.0, 0.0, 1.0)},
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
        atmosphereUniforms['filmWidth'].value = camera.getFilmWidth();
        atmosphereUniforms['filmHeight'].value = camera.getFilmHeight();
        atmosphereUniforms['cameraPosition'].value = camera.position;
        atmosphereUniforms['cameraUp'].value.applyQuaternion(camera.quaternion)
        atmosphereUniforms['cameraFront'].value.applyQuaternion(camera.quaternion)

        this.materialBokeh = new ShaderMaterial({
            defines: Object.assign({}, atmosphereShader.defines),
            uniforms: atmosphereUniforms,
            vertexShader: atmosphereShader.vertexShader,
            fragmentShader: atmosphereShader.fragmentShader
        });

        this.uniforms = atmosphereUniforms;
        this.needsSwap = false;

        this.fsQuad = new Pass.FullScreenQuad(this.materialBokeh);

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
        this.uniforms['filmWidth'].value = this.camera.getFilmWidth();
        this.uniforms['filmHeight'].value = this.camera.getFilmHeight();
        this.uniforms['focal'].value = this.camera.getFocalLength();
        this.uniforms['cameraPosition'].value = this.camera.position;
        this.uniforms['cameraUp'].value.set(0.0, 1.0, 0.0)
        this.uniforms['cameraFront'].value.set(0.0, 0.0, 1.0)
        this.uniforms['cameraUp'].value.applyQuaternion(this.camera.quaternion)
        this.uniforms['cameraFront'].value.applyQuaternion(this.camera.quaternion)

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
