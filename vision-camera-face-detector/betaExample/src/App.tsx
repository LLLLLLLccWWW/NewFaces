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
