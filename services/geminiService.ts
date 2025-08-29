import { GoogleGenAI, Modality } from "@google/genai";

// Utility to convert a File object to a base64 string and get its MIME type.
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Edits a single image based on a text prompt.
 * Used for Magic Studio (Instruct, Mockup).
 * @param imageFile The image to edit.
 * @param prompt The text prompt describing the desired edit.
 * @returns The base64 string of the edited image.
 */
export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [imagePart, { text: prompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error('No image was generated. The model may have refused the request.');
};

/**
 * Composites two images together based on a text prompt.
 * Used for Magic Studio (Composite).
 * @param baseImageFile The primary image (e.g., background, model).
 * @param overlayImageFile The secondary image (e.g., product, logo).
 * @param prompt The text prompt describing how to merge the images.
 * @returns The base64 string of the composited image.
 */
export const compositeImages = async (baseImageFile: File, overlayImageFile: File, prompt: string): Promise<string> => {
    const baseImagePart = await fileToGenerativePart(baseImageFile);
    const overlayImagePart = await fileToGenerativePart(overlayImageFile);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          baseImagePart, 
          overlayImagePart,
          { text: prompt }
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
  
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error('No image was generated. The model may have refused the request.');
};

// Fix: Added missing generateAdCreative function.
/**
 * Generates an ad creative image from a text prompt.
 * Used for Ad Composer.
 * @param prompt The text brief for the ad.
 * @returns The base64 string of the generated image.
 */
export const generateAdCreative = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  
  throw new Error('No image was generated. The model may have refused the request.');
};


/**
 * Generates a video from an image and a text prompt.
 * Used for Video Synthesizer.
 * @param imageFile The source image.
 * @param prompt The prompt describing the animation.
 * @param onProgress Callback to report progress.
 * @returns The URL of the generated video.
 */
export const generateVideo = async (
  imageFile: File,
  prompt: string,
  onProgress: (message: string) => void
): Promise<string> => {
  onProgress('Preparing video generation...');
  const imagePart = await fileToGenerativePart(imageFile);
  
  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    image: {
      imageBytes: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType,
    },
    config: {
      numberOfVideos: 1,
    },
  });

  onProgress('Video generation started. This may take a few minutes...');
  let checks = 0;
  const progressMessages = [
    "Analyzing image and prompt...",
    "Choreographing pixel performance...",
    "Rendering frames... almost there.",
    "Finalizing video... adding a touch of magic.",
  ];

  while (!operation.done) {
    onProgress(progressMessages[checks % progressMessages.length]);
    checks++;
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  onProgress('Video generation complete!');

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error('Video generation failed or returned no link.');
  }
  
  onProgress('Downloading video...');
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`);
  }
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};
