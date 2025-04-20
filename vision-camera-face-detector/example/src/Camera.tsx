import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
  Text,
  Image,
  BackHandler,
} from 'react-native';
import {
  Frame,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  Dimensions,
  Face,
  faceBoundsAdjustToView,
  scanFaces,
  sortFormatsByResolution,
} from '@mat2718/vision-camera-face-detector';
import { runOnJS } from 'react-native-reanimated';
import { Camera } from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer , useNavigation,useRoute } from '@react-navigation/native';
import { navigationRef, navigate } from './RootNavigation'; // 確保正確導入navigate
import ImageResizer from 'react-native-image-resizer';
import FaceDetection from '@react-native-ml-kit/face-detection';
import RNFS from 'react-native-fs';
import PhotoScreen from './PhotoScreen'; // 確保正確導入PhotoScreen
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

const focalLength = 2700; // 焦距（單位：像素）
const sensorHeight = 0.47; // 感光元件尺寸（單位：厘米）

const Stack = createStackNavigator();

const CameraScreen = ({ route }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const direction = 'front';
  const device = devices[direction];
  const camera = useRef<Camera>(null);
  const [faces, setFaces] = useState([]);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const landscapeMode = screenWidth > screenHeight;
  const [frameDimensions, setFrameDimensions] = useState();
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);
  const shouldTakePicture = useRef(false);
  const hasTakenPicture = useRef(false);
  const [photoPath, setPhotoPath] = useState(null);
  const countdown = useSharedValue(3);
  const countdownFinished = useSharedValue(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const countdownText = useAnimatedStyle(() => ({
    opacity: countdown.value === 0 ? 0 : 1,
    transform: [{ scale: countdown.value === 0 ? 0 : 1 }],
  }));
  const distanceBuffer = useRef([]); // 用於保存距離值的緩衝區
  const BUFFER_SIZE = 5; // 緩衝區大小
  const frameCounter = useRef(0); // 初始化 frameCounter
  const [distance, setDistance] = useState(null);
  const [angle, setAngle] = useState(null);

  const navigation = useNavigation();
  

  useEffect(() => {
    const initializeTensorFlow = async () => {
      await tf.ready();
      await tf.setBackend('cpu');
    };
    initializeTensorFlow();
  }, []);

  useEffect(() => {
    const resetCamera = () => {
      setPhotoPath(null);
      hasTakenPicture.current = false;
      shouldTakePicture.current = true;  // 設置為 true 以觸發拍照
      setDistance(null);
      setAngle(null);
      distanceBuffer.current = [];
      frameCounter.current = 0;
      setIsCountingDown(false);
      countdown.value = 3;
      setIsActive(true);
    };

    // 檢查路由參數
    if (route.params?.shouldResetCamera) {
      resetCamera();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.shouldResetCamera){
        // 當頁面獲得焦點時重置相機
        resetCamera();

        navigation.setParams({ shouldResetCamera: undefined });
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.shouldResetCamera]);
  
  
  useEffect(() => {
    const backAction = () => {
      // 僅在必要時重置狀態
      if (hasTakenPicture.current) {
        setPhotoPath(null);
        hasTakenPicture.current = false;
        distanceBuffer.current = [];
        setDistance(null);
        setAngle(null);
      }
      return true;
    };
  
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);
  

  useEffect(() => {
    return () => {
      setIsActive(false);
    };
  }, []);

  const formats = useMemo(() => device?.formats.sort(sortFormatsByResolution), [device?.formats]);
  const [format, setFormat] = useState(formats && formats.length > 0 ? formats[0] : undefined);

  const handleScan = useCallback((frame, newFaces) => {
    const isRotated = !landscapeMode;
    setFrameDimensions(
      isRotated
        ? {
            width: frame.height,
            height: frame.width,
          }
        : {
            width: frame.width,
            height: frame.height,
          },
    );
    setFaces(newFaces);
  }, [landscapeMode]);

  useEffect(() => {
    setFormat(formats && formats.length > 0 ? formats[0] : undefined);
  }, [device]);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      try {
        const scannedFaces = scanFaces(frame);
        runOnJS(handleScan)(frame, scannedFaces);
      } catch (e) {
        runOnJS(setError)(e.message);
      }
    },
    [handleScan],
  );

  useEffect(() => {
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'authorized');
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  const processImage = async (uri: any) => {
    console.log('Processing image:', uri);
    try {
      // 1. 先取得原始圖片信息
      const originalImage = await ImageResizer.createResizedImage(
        uri,
        4000,  // 設置一個較大的值，確保不會縮小原圖
        4000,
        'JPEG',
        100,
        0,
        undefined,
        false,
        { mode: 'contain' }
      );
      
      console.log('Original image info:', originalImage);
      
      // 2. 計算適當的尺寸比例，保持原始寬高比
      const aspectRatio = originalImage.width / originalImage.height;
      let targetWidth = 1080;  // 您想要的寬度
      let targetHeight = Math.round(targetWidth / aspectRatio);
      
      // 如果高度超過1920，則以高度為基準重新計算
      if (targetHeight > 1920) {
        targetHeight = 1920;
        targetWidth = Math.round(targetHeight * aspectRatio);
      }
      
      // 3. 執行精確的尺寸調整
      const resizedImage = await ImageResizer.createResizedImage(
        uri,
        targetWidth,
        targetHeight,
        'JPEG',
        90,    // 提高質量到90%
        0,
        undefined,
        true,  // 保持縱橫比
        { 
          mode: 'contain',
          onlyScaleDown: true  // 只縮小，不放大
        }
      );
      
      console.log('Resized image info:', {
        width: resizedImage.width,
        height: resizedImage.height,
        uri: resizedImage.uri
      });
      
      // 4. 如果需要，進行臉部識別
      try {
        const faces = await FaceDetection.detect(resizedImage.uri, { 
          landmarkMode: 'all' 
        });
        console.log('Face detection result:', faces);
      } catch (error) {
        console.warn('Face detection error:', error);
      }
      
      return resizedImage.uri;
    } catch (error) {
      console.error('Error in processImage:', error);
      throw error;
    }
  };
  
  // 修改 takePicture 函數中的相關部分
  const takePicture = useCallback(async () => {
    if (camera.current) {
      try {
        const photo = await camera.current.takePhoto({
          qualityPrioritization: 'quality',
          flash: 'off',
          enableAutoStabilization: true,
          skipMetadata: true
        });
        
        console.log('Original photo taken:', {
          path: photo.path,
          width: photo.width,
          height: photo.height
        });
        
        const processedUri = await processImage(photo.path);
        console.log('Processed photo:', processedUri);
        
        setPhotoPath(processedUri);
        shouldTakePicture.current = false;
        hasTakenPicture.current = true;
        countdown.value = 0;
        setIsCountingDown(false);
        countdownFinished.value = false;
        
        const {gender, hairPreference} = route.params || {};
        navigate('PhotoScreen', { 
          imagePath: processedUri, 
          gender, 
          hairPreference,
          originalDimensions: {
            width: photo.width,
            height: photo.height
          }
        });
        
      } catch (error) {
        console.error('Photo capture/processing error:', error);
        throw error;
      }
    }
  }, [camera, route.params]);

  

  useEffect(() => {
    if (shouldTakePicture.current && !isCountingDown) {
      setIsCountingDown(true);
      countdown.value = 3;
      countdown.value = withTiming(0, { duration: 3000 }, finished => {
        if (finished) {
          countdownFinished.value = true;
        }
      });
    }
  }, [shouldTakePicture.current, isCountingDown]);

  useEffect(() => {
    if (countdownFinished.value) {
      takePicture();
    }
  }, [countdownFinished.value, takePicture]);

  const styles = StyleSheet.create({
    boundingBox: {
      borderRadius: 5,
      borderWidth: 3,
      borderColor: 'yellow',
      position: 'absolute',
    },
    crossSectionContainer: {
      height: 15,
      width: 15,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      top: screenHeight / 2,
      left: screenWidth / 2,
    },
    verticalCrossHair: {
      height: '100%',
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: 'yellow',
      borderWidth: 1,
    },
    horizontalCrossHair: {
      width: '100%',
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: 'yellow',
      borderWidth: 1,
    },
    photoPreview: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 10,
    },
    distanceText: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'red',
      // backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 10,
      fontSize: 20,
      zIndex: 20,
      fontFamily: 'monospace',
      fontWeight: 'bold',
    },
    angleText: {
      position: 'absolute',
      top: 80,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'red',
      // backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 10,
      fontSize: 20,
      fontFamily: 'monospace',
      fontWeight: 'bold',
    },
    countdownText: {
      position: 'absolute',
      top: screenHeight / 2 - 50,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 100,
      color: 'white',
      zIndex: 10,
    },
    photoDistanceText: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 10,
      fontSize: 20,
      zIndex: 20,
    },
  });

  const boundingStyle = useMemo(
    () => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: screenWidth,
      height: screenHeight,
    }),
    [screenWidth, screenHeight],
  );

  const calculateFaceDistance = (face) => {
    if (!face.bounds || face.bounds.width === undefined) {
      console.log('Face bounds or width is undefined');
      return null;
    }

    const focalLength = 2700;
    const realEyeDistance = 6.3;
    const eyeDistanceInPixels = face.bounds.width;

    const distance = (focalLength * realEyeDistance) / eyeDistanceInPixels;
    // console.log('Calculated distance (cm):', distance);
    return distance;
  };

  const calculateFaceAngle = (face) => {
    if (face.rollAngle === undefined) {
      return null;
    }
    return face.rollAngle;
  };

  const handleFaces = useCallback((newFaces) => {
    frameCounter.current += 1;

    if (newFaces.length > 0) {
      const calculatedDistance = calculateFaceDistance(newFaces[0]);
      const calculatedAngle = calculateFaceAngle(newFaces[0]);
      // console.log('Calculated distance (cm):', calculatedDistance);
      // console.log('Calculated angle (degrees):', calculatedAngle);

      if (calculatedDistance !== null) {
        setDistance(prevDistance => {
          if (calculatedDistance.toFixed(2) !== (prevDistance?.toFixed(2) || '')) {
            return calculatedDistance;
          }
          return prevDistance;
        });

        distanceBuffer.current.push(calculatedDistance);
        if (distanceBuffer.current.length > BUFFER_SIZE) {
          distanceBuffer.current.shift();
        }

        const avgDistance = distanceBuffer.current.reduce((a, b) => a + b, 0) / distanceBuffer.current.length;
        // console.log(`Average distance (cm): ${avgDistance}`);

        if (frameCounter.current % 5 === 0) {
          if (avgDistance >= 18 && avgDistance <= 22.5 && Math.abs(calculatedAngle) <= 5 && !shouldTakePicture.current && !hasTakenPicture.current) {
            shouldTakePicture.current = true;
          } else if (
            !(avgDistance >= 18 && avgDistance <= 22.5 && Math.abs(calculatedAngle) <= 5) &&
            isCountingDown
          ) {
            countdown.value = 3;
            setIsCountingDown(false);
            shouldTakePicture.current = false;
          }
        }
      }

      if (calculatedAngle !== null) {
        setAngle(calculatedAngle);
      }
    }
  }, [isCountingDown]);

  useEffect(() => {
    handleFaces(faces);
  }, [faces, handleFaces]);

  return device != null && hasPermission ? (
    <>
      {error && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'red' }}>
          <Text style={{ color: 'white' }}>{error}</Text>
        </View>
      )}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        torch={'off'}
        isActive={isActive}
        ref={camera}
        photo={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={30}
        audio={false}
        format={format}
      />
      <View style={styles.crossSectionContainer}>
        <View style={styles.verticalCrossHair} />
        <View style={styles.horizontalCrossHair} />
      </View>
      <View style={boundingStyle} testID="faceDetectionBoxView">
        {frameDimensions &&
          (() => {
            const mirrored = Platform.OS === 'android' && direction === 'front';
            const { adjustRect } = faceBoundsAdjustToView(
              frameDimensions,
              {
                width: screenWidth,
                height: screenHeight,
              },
              landscapeMode,
              50,
              50,
            );
            return faces
              ? faces.map((i, index) => {
                  const { left, ...others } = adjustRect(i.bounds);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.boundingBox,
                        {
                          ...others,
                          [mirrored ? 'right' : 'left']: left,
                        },
                      ]}
                    />
                  );
                })
              : null;
          })()}
      </View>
      {distance !== null && (
        <Text style={styles.distanceText}>
          {`距離: ${distance.toFixed(2)} cm`}
        </Text>
      )}
      {angle !== null && (
        <Text style={styles.angleText}>
          {`角度: ${angle.toFixed(2)} 度`}
        </Text>
      )}
      {/* {photoPath && (
        <>
          <Image source={{ uri: `file://${photoPath}` }} style={styles.photoPreview} />
          <Text style={styles.photoDistanceText}>照片已拍攝</Text>
        </>
      )} */}
      {isCountingDown && (
        <Animated.Text style={[styles.countdownText, countdownText]}>
          {countdown.value > 0 ? countdown.value.toFixed(0) : ''}
        </Animated.Text>
      )}
    </>
  ) : null;
};
export default CameraScreen;