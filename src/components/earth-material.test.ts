import { expect, it, vi } from 'vitest';

const { shaders } = vi.hoisted(() => ({ shaders: [] as { fragmentShader: string }[] }));
vi.mock('three', () => ({
  SRGBColorSpace: 'srgb',
  Vector3: class {},
  TextureLoader: class {
    loadAsync = async () => ({ colorSpace: '', dispose: vi.fn() });
  },
  ShaderMaterial: class {
    constructor(options: { fragmentShader: string }) { shaders.push(options); }
    dispose = vi.fn();
  },
}));
import { makeEarthMaterial } from './earth-material';

it('emits real GLSL directive line breaks, not escaped text', async () => {
  const result = await makeEarthMaterial();
  const shader = shaders.at(-1)!.fragmentShader;
  expect(shader).not.toContain('\\n');
  expect(shader).toContain('\n#include <colorspace_fragment>\n');
  result.dispose();
});
