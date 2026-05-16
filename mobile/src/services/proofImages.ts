import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const MAX_PROOF_IMAGE_BYTES = 1.8 * 1024 * 1024;
const MAX_PROOF_IMAGE_WIDTH = 1280;
const PROOF_IMAGE_COMPRESS = 0.48;

export type ProofImage = {
  uri: string;
  base64: string;
  mimeType: string;
  fileName: string;
  bytes: number;
};

type ProofImageOptions = {
  fileName: string;
  permissionMessage?: string;
  source?: 'camera' | 'library';
};

export async function captureProofImage(options: ProofImageOptions): Promise<ProofImage | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error(options.permissionMessage || 'Allow camera access to capture proof photo.');
  }

  const result = await ImagePicker.launchCameraAsync({ quality: 0.75 })
    .catch(() => ImagePicker.launchImageLibraryAsync({ quality: 0.75, mediaTypes: ImagePicker.MediaTypeOptions.Images }));
  return imageResultToProof(result, options.fileName);
}

export async function pickProofImage(options: ProofImageOptions): Promise<ProofImage | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.75,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });
  return imageResultToProof(result, options.fileName);
}

async function imageResultToProof(result: ImagePicker.ImagePickerResult, fileName: string): Promise<ProofImage | null> {
  if (result.canceled) return null;
  const asset = result.assets[0];
  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: MAX_PROOF_IMAGE_WIDTH } }],
    {
      compress: PROOF_IMAGE_COMPRESS,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  const base64 = manipulated.base64 || '';
  if (!base64) throw new Error('Proof image could not be prepared. Please capture it again.');
  const bytes = estimateBase64Bytes(base64);
  if (bytes > MAX_PROOF_IMAGE_BYTES) {
    throw new Error('Proof image is still too large. Please retake a clear close photo and try again.');
  }
  return {
    uri: manipulated.uri,
    base64,
    mimeType: 'image/jpeg',
    fileName,
    bytes,
  };
}

function estimateBase64Bytes(value: string) {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  return Math.ceil((value.length * 3) / 4) - padding;
}
