import { fal } from '@fal-ai/client';
import { pick } from 'lodash-es';
import { ClientOptions } from 'openai';

import { LobeRuntimeAI } from '../BaseAI';
import { CreateImagePayload, CreateImageResponse } from '../types/image';

type FluxDevOutput = Awaited<ReturnType<typeof fal.subscribe<'fal-ai/flux/dev'>>>['data'];

const DEFAULT_API_KEY = 'Not set api key for fal, bro!';

export class LobeFalAI implements LobeRuntimeAI {
  constructor({ apiKey }: ClientOptions = {}) {
    fal.config({
      credentials: apiKey ?? DEFAULT_API_KEY,
    });
  }

  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { model, params } = payload;

    const paramsMap = new Map<string, string>([
      ['steps', 'num_inference_steps'],
      ['cfg', 'guidance_scale'],
    ]);

    const defaultInput = {
      enable_safety_checker: false,
      num_images: 1,
    };
    const userInput = Object.fromEntries(
      Object.entries(params).map(([key, value]) => [paramsMap.get(key) ?? key, value]),
    );
    const endpoint = `fal-ai/${model}`;
    const { data } = await fal.subscribe(endpoint, {
      input: {
        ...defaultInput,
        ...userInput,
      },
    });
    const image = (data as FluxDevOutput).images[0];

    return {
      imageUrl: image.url,
      ...pick(image, ['width', 'height']),
    };
  }
}
