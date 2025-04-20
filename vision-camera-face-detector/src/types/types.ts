/**
 * Dimensions is an object with a width property that is a number and a height property that is a
 * number.
 * @property {number} width - The width of the image in pixels.
 * @property {number} height - The height of the image in pixels.
 */
export type Dimensions = {width: number; height: number};

/**
 * Rect is an object with four properties: top, left, height, and width, all of which are numbers.
 * @property {number} top - The top position of the element.
 * @property {number} left - The x-coordinate of the top-left corner of the rectangle.
 * @property {number} height - The height of the element.
 * @property {number} width - The width of the element.
 */
export type Rect = {
  /** the y coordinate in the center of the face bounds */
  y?: number;
  /** the x coordinate in the center of the face bounds */
  x?: number;
  /** the top of the face bounds */
  top: number;
  /** the left of the face bounds */
  left: number;
  /** the bottom of the face bounds */
  bottom?: number;
  /** the right of the face bounds */
  right?: number;
  /** the height of the face bounds */
  height: number;
  /** the width of the face bounds */
  width: number;
};

export type Point = {x: number; y: number};

export interface Face {
  leftEyeOpenProbability: number;
  rollAngle: number;
  pitchAngle: number;
  yawAngle: number;
  rightEyeOpenProbability: number;
  smilingProbability: number;
  bounds: {
    /** the y coordinate in the center of the face bounds */
    y: number;
    /** the x coordinate in the center of the face bounds */
    x: number;
    /** the top of the face bounds */
    top: number;
    /** the left of the face bounds */
    left: number;
    /** the bottom of the face bounds */
    bottom: number;
    /** the right of the face bounds */
    right: number;
    /** the height of the face bounds */
    height: number;
    /** the width of the face bounds */
    width: number;
  };
  contours: {
    FACE: Point[];
    NOSE_BOTTOM: Point[];
    LOWER_LIP_TOP: Point[];
    RIGHT_EYEBROW_BOTTOM: Point[];
    LOWER_LIP_BOTTOM: Point[];
    NOSE_BRIDGE: Point[];
    RIGHT_CHEEK: Point[];
    RIGHT_EYEBROW_TOP: Point[];
    LEFT_EYEBROW_TOP: Point[];
    UPPER_LIP_BOTTOM: Point[];
    LEFT_EYEBROW_BOTTOM: Point[];
    UPPER_LIP_TOP: Point[];
    LEFT_EYE: Point[];
    RIGHT_EYE: Point[];
    LEFT_CHEEK: Point[];
  };
}
