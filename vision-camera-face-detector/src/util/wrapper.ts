import type {Frame} from 'react-native-vision-camera';
import type {Face} from '../types/types';

/**
 * It takes a frame, and returns an array of faces
 * @param {Frame} frame - The frame to scan for faces.
 * @returns The return value is an array of Face objects.
 */
export default function scanFaces(frame: Frame): Face[] {
  'worklet';
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return __scanFaces(frame);
}
