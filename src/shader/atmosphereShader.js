const TestShader = {

    defines: {
        'DEPTH_PACKING': 1,
        'PERSPECTIVE_CAMERA': 1,
    },

    uniforms: {

        'tColor': {value: null},
        'tDepth': {value: null},
        'focus': {value: 1.0},
        'aspect': {value: 1.0},
        'aperture': {value: 0.025},
        'maxblur': {value: 0.01},
        'nearClip': {value: 1.0},
        'farClip': {value: 1000.0},

    },

    vertexShader: /* glsl */`
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

    fragmentShader: /* glsl */`
		#include <common>
		varying vec2 vUv;
		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float nearClip;
		uniform float farClip;
		uniform float focus;
		uniform float aspect;

		#include <packing>
		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}
		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}
		void main() {
			float viewZ = -perspectiveDepthToViewZ(unpackRGBAToDepth(texture2D( tDepth, vUv )), nearClip, farClip);
            if(viewZ >= 20.0)
            {
			    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
            else
            {
                gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            }
		}`

};

export {TestShader};
