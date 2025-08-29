// Fix: Added React import for React.ReactNode type.
import React from 'react';

export enum StudioTool {
  Instruct = 'INSTRUCT',
  Composite = 'COMPOSITE',
  Mockup = 'MOCKUP',
}

export const INSTRUCT_TEMPLATES = [
  { name: 'Anime Style', prompt: 'Convert this image to a vibrant, high-quality anime style.' },
  { name: 'Cinematic Look', prompt: 'Give this image a cinematic look, with dramatic lighting and a widescreen feel.' },
  { name: 'Vintage Photo', prompt: 'Make this image look like a vintage photograph from the 1970s, with faded colors and film grain.' },
  { name: 'Watercolor', prompt: 'Transform this image into a soft and flowing watercolor painting.' },
  { name: 'Pixel Art', prompt: 'Convert this image into detailed 16-bit pixel art.' },
  { name: 'Neon Punk', prompt: 'Add a neon-punk aesthetic to this image with glowing highlights and a dark, moody atmosphere.' },
];

export const MOCKUP_TEMPLATES = [
  { name: 'Coffee Mug', prompt: 'a white coffee mug on a clean, modern desk.' },
  { name: 'T-Shirt', prompt: 'a black t-shirt worn by a model in an urban street setting.' },
  { name: 'Billboard', prompt: 'a large billboard in a bustling city square at dusk.' },
  { name: 'Laptop Screen', prompt: 'the screen of a modern laptop in a bright, airy office.' },
  { name: 'Poster', prompt: 'a poster on a weathered brick wall.' },
];

export const COMPOSITE_TEMPLATES = [
  { name: 'Product Ad', prompt: 'Create a professional product advertisement by placing the overlay image onto the base image background. Ensure lighting is commercial-grade.' },
  { name: 'Change Background', prompt: 'Replace the background of the overlay image with the new background from the base image. Make the cutout clean and the blend seamless.' },
  { name: 'Artistic Blend', prompt: 'Blend the two images together in a creative, artistic, double-exposure style.' },
];

export const VIDEO_CUSTOM_TEMPLATES = [
    { name: 'Cinematic Fly-Through', prompt: 'A dramatic, slow, cinematic fly-through of the scene.' },
    { name: 'Fade to Color', prompt: 'The image slowly transitions from black and white to full, vibrant color.' },
    { name: 'Floating Particles', prompt: 'Subtle, glowing particles of light gently float across the screen.' },
    { name: 'Gentle Wind', prompt: 'A gentle breeze makes elements like leaves, hair, or fabric rustle and sway naturally.' },
];


// Fix: Added missing EditorTool enum.
export enum EditorTool {
  Instruct = 'INSTRUCT',
  Resize = 'RESIZE',
  Extend = 'EXTEND',
}

// Fix: Added missing ASPECT_RATIOS constant.
export const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 Square' },
  { value: '16:9', label: '16:9 Widescreen' },
  { value: '9:16', label: '9:16 Vertical' },
  { value: '4:3', label: '4:3 Standard' },
  { value: '3:4', label: '3:4 Portrait' },
];

// Fix: Added missing FeatureId enum.
export enum FeatureId {
  MagicEditor = 'MAGIC_EDITOR',
  MockupStudio = 'MOCKUP_STUDIO',
  AdComposer = 'AD_COMPOSER',
  VariationEngine = 'VARIATION_ENGINE',
}

// Fix: Added missing Feature interface.
export interface Feature {
  id: FeatureId;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Fix: Added missing FEATURES constant. Icons are set to null as ReactNode can be null,
// and this avoids having JSX in a .ts file.
export const FEATURES: { [key in FeatureId]: Feature } = {
  [FeatureId.MagicEditor]: {
    id: FeatureId.MagicEditor,
    title: 'Magic Editor',
    description: 'Instruct, resize, or extend your images with simple commands.',
    icon: null,
  },
  [FeatureId.MockupStudio]: {
    id: FeatureId.MockupStudio,
    title: 'Mockup Studio',
    description: 'Generate realistic mockups for your products and designs.',
    icon: null,
  },
  [FeatureId.AdComposer]: {
    id: FeatureId.AdComposer,
    title: 'Ad Composer',
    description: 'Create stunning ad creatives from a simple text brief.',
    icon: null,
  },
  [FeatureId.VariationEngine]: {
    id: FeatureId.VariationEngine,
    title: 'Variation Engine',
    description: 'Generate stylistic variations of an image to explore creative options.',
    icon: null,
  },
};