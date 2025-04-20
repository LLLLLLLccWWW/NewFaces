# @mat2718/vision-camera-face-detector

VisionCamera Frame Processor Plugin to detect faces using MLKit Vision Face Detector. This repo is an updated version of the original vision-camera-face-detector but with some necessary updates.

1. MLKit version is updated to align with other vision camera plugins such as the OCR plugin
2. Face bounds have been updated to include more options for end users to choose from such as top, and left rather than just the x and y axis for android.
3. A helper function has been added for those using headers or footers to adjust the bounding box parameters. A working example using React-native 0.70.6 and updated reanimated and vision camera packages are located here: [example](https://github.com/mat2718/vision-camera-face-detector/tree/master/example)
4. IOS face bounds have been updated to include more options for end users to choose from such as top and left rather than just the x and y axis for android.
5. Added a helper function to display only the face closest to the x and y params passed.

## Breaking Changes

Currently, the face contour data is causing an error in the native code and has been disabled temporarily while I work to resolve the issue. The error was causing the bounding box and other frame information from being passed to the component. To avoid this issue please ensure you are using version >=0.1.11

## Installation & Configuration

### Install

```sh
# install with npm
npm install @mat2718/vision-camera-face-detector

# or install with yarn
yarn add @mat2718/vision-camera-face-detector
```

### Configure

### Add the below plugin to your babel config file

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      'react-native-reanimated/plugin',
      {
        globals: ['__scanFaces'],
      },
    ],
  ],
};
```

### Add the following permission to the AndroidManifest.xml located at ~/android/app/src/AndroidManifest.xml

```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

---

## Basic Usage

```tsx
import * as React from 'react';
import {runOnJS} from 'react-native-reanimated';

import {StyleSheet} from 'react-native';
import {useCameraDevices, useFrameProcessor} from 'react-native-vision-camera';

import {Camera} from 'react-native-vision-camera';
import {scanFaces, Face} from '@mat2718/vision-camera-face-detector';

export default function App() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [faces, setFaces] = React.useState<Face[]>();

  const devices = useCameraDevices();
  const device = devices.front;

  React.useEffect(() => {
    console.log(faces);
  }, [faces]);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const scannedFaces = scanFaces(frame);
    runOnJS(setFaces)(scannedFaces);
  }, []);

  return device != null && hasPermission ? (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      frameProcessorFps={5}
    />
  ) : null;
}
```

## Advanced Example

[Advanced Example](https://github.com/mat2718/vision-camera-face-detector/tree/master/example/advanced)

## Utils

### Find Face Closest to Center

```ts
import {findClosest} from '@mat2718/vision-camera-face-detector';
/**
 * It sorts an array of objects by the distance between the object's x and y coordinates and the
 * given x and y coordinates, then returns the first object in the sorted array
 * @param {Face[]} arr - Face[] - an array of Face objects
 * @param {number} x - The x coordinate
 * @param {number} y - number - the y coordinate
 * @returns the closest face to the x and y coordinates.
 */
findClosest(arr, x, y);
```

## Alpha release using a singular component design

NOTE: This is still an early release and is not intended for enterprise applications yet. Currently, the projected BETA release is sometime before the end of January 2023.

```tsx
import React from 'react';

import {FaceDetector} from '@mat2718/vision-camera-face-detector';
import RNFS from 'react-native-fs';

const App = () => {
  //********************************************************************
  // Components
  //********************************************************************

  return (
    <>
      <FaceDetector
        boundingBoxColor={'yellow'}
        enableBoundingBox={true}
        boundingBoxMultipleFaces={false}
        photoCaptureOnPress={async photo => {
          const photoPath = 'file://' + photo.path;
          const base64Photo = await RNFS.readFile(photoPath, 'base64');
          console.log('photoCaptureOnPress', base64Photo);
          // do something with the photo
        }}
      />
    </>
  );
};

export default App;
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

## Credits

Please feel free to check out the original repo here [vision-camera-face-detector](https://github.com/rodgomesc/vision-camera-face-detector)

Also, the original bounding box creator's repo is here [bglgwyng/FrameProcessorExample](https://github.com/bglgwyng/FrameProcessorExample/tree/face-detection-bounding-box)

```

```
