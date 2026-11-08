import { ShaderMaterial,TextureLoader,Vector3,SRGBColorSpace } from 'three';
import { subsolarPoint } from '@/lib/solar';
export async function makeEarthMaterial(){
 const loader=new TextureLoader();const [day,night]=await Promise.all([loader.loadAsync('/textures/earth-day.jpg'),loader.loadAsync('/textures/earth-night.jpg')]);day.colorSpace=night.colorSpace=SRGBColorSpace;
 const material=new ShaderMaterial({uniforms:{dayMap:{value:day},nightMap:{value:night},sun:{value:new Vector3(1,0,0)},enabled:{value:1}},vertexShader:`varying vec2 earthUV; varying vec3 earthNormal; void main(){earthUV=uv;earthNormal=normalize(normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D dayMap;uniform sampler2D nightMap;uniform vec3 sun;uniform float enabled;varying vec2 earthUV;varying vec3 earthNormal;void main(){float light=dot(normalize(earthNormal),normalize(sun));float blend=mix(1.0,smoothstep(-0.12,0.14,light),enabled);vec3 day=texture2D(dayMap,earthUV).rgb;vec3 night=texture2D(nightMap,earthUV).rgb;gl_FragColor=vec4(mix(night*0.72,day,blend),1.0);
#include <tonemapping_fragment>\n#include <colorspace_fragment>
}`,toneMapped:false});
 return {apply:(globe)=>globe.globeMaterial(material),update:(globe,time,enabled)=>{const p=subsolarPoint(time);const xyz=globe.getCoords(p.lat,p.lon);material.uniforms.sun.value.set(xyz.x,xyz.y,xyz.z).normalize();material.uniforms.enabled.value=enabled?1:0},dispose:()=>{day.dispose();night.dispose();material.dispose()}};
}
