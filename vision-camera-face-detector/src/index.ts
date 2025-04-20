// entry file

// FaceDetector.tsx
export {default as FaceDetector} from './components/FaceDetector';
// types.ts
export type {Dimensions, Face, Rect, Point} from './types/types';
// faceBoundsAdjustToView.ts
export {faceBoundsAdjustToView} from './util/faceBoundsAdjustToView';
// resolutions.ts
export {sortFormatsByResolution, findClosest} from './util/generalUtil';
// wrapper.ts
export {default as scanFaces} from './util/wrapper';
