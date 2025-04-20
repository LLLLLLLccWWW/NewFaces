import {Platform} from 'react-native';
import type {Dimensions, Rect} from '../types/types';

/**
 * It takes a frame and a view, and returns an object with two functions: adjustPoint and adjustRect
 * @param {Dimensions} frame - Dimensions - the dimensions of the video frame
 * @param {Dimensions} view - Dimensions
 * @returns An object with two functions.
 * @resource https://github.com/bglgwyng/FrameProcessorExample/blob/e8e99d58c878d4dce9a8adf74a7447d253be93ab/adjustToView.ts#L21
 */
export const faceBoundsAdjustToView =
  Platform.OS === 'ios'
    ? (frame: Dimensions, view: Dimensions) => {
        const widthRatio = view.width / frame.width;
        const heightRatio = view.height / frame.height;
        return {
          adjustPoint: (point: {x: number; y: number}) => ({
            x: point.x * widthRatio,
            y: point.y * heightRatio,
          }),
          adjustRect(rect: Rect): Rect {
            return {
              left: rect.left * widthRatio,
              top: rect.top * heightRatio,
              width: rect.width * widthRatio,
              height: rect.height * heightRatio,
            };
          },
        };
      }
    : (
        frame: Dimensions,
        view: Dimensions,
        landscape: boolean,
        verticalPadding?: number,
        horizontalPadding?: number,
      ) => {
        // settings up the variables
        const {width, height} = view;
        const {width: frameWidth, height: frameHeight} = frame;
        let aspectRatio: number;
        let widthRatio: number;
        let heightRatio: number;
        let offsetX = 0;
        let offsetY = 0;
        const topPadding = verticalPadding ? verticalPadding / 2 : 0;
        const leftPadding = horizontalPadding ? horizontalPadding / 2 : 0;
        const verticalCropPadding = verticalPadding ?? 0;
        const horizontalCropPadding = horizontalPadding ?? 0;

        if (!landscape) {
          // portrait
          /* Calculating the aspect ratio of the view. */
          aspectRatio = width / height;
          heightRatio = height / frameHeight;
          const croppedFrameWidth = aspectRatio * frameHeight;
          offsetX = (frameWidth - croppedFrameWidth) / 2;
          widthRatio = width / croppedFrameWidth;
        } else {
          // landscape
          /* Calculating the aspect ratio of the view. */
          aspectRatio = height / width;
          widthRatio = width / frameWidth;
          const croppedFrameHeight = aspectRatio * frameWidth;
          offsetY = (frameHeight - croppedFrameHeight) / 2;
          heightRatio = height / croppedFrameHeight;
        }
        /* Returning an object with two functions. */
        return {
          adjustPoint: (point: {x: number; y: number}) => ({
            x: (point.x - offsetX) * widthRatio,
            y: (point.y - offsetY) * heightRatio,
          }),
          adjustRect: (rect: Rect) => ({
            top: (rect.top - offsetY - topPadding) * heightRatio,
            left: (rect.left - offsetX - leftPadding) * widthRatio,
            height: (rect.height + verticalCropPadding) * heightRatio,
            width: (rect.width + horizontalCropPadding) * widthRatio,
          }),
        };
      };
