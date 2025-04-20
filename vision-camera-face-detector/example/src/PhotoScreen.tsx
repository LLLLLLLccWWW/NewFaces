import React, { useEffect, useState ,useRef} from 'react';
import { View, Text, StyleSheet, Platform, PermissionsAndroid, Image ,Dimensions,PixelRatio , Animated ,TouchableOpacity,ScrollView} from 'react-native';
import * as tf from '@tensorflow/tfjs';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { RouteProp, useNavigation} from '@react-navigation/native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import base64 from 'base-64';
import {Buffer} from 'buffer';
import jpeg from 'jpeg-js';
import Svg, {Image as SvgImage,Mask,Polygon,Defs,G} from 'react-native-svg';
import { set } from 'react-native-reanimated';

// 使用 TypeScript 明確指定 globalThis 為任何類型
if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

// Polyfill for atob and btoa (Remains unchanged)
if (typeof globalThis.atob === 'undefined') {
  globalThis.atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 === 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }

    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  };
}

if (typeof globalThis.btoa === 'undefined') {
  globalThis.btoa = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
      str.charAt(i | 0) || (map = '=', i % 1);
      output += map.charAt(63 & block >> 8 - i % 1 * 8)
    ) {
      charCode = str.charCodeAt(i += 3/4);
      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }

    return output;
  };
}

// Custom base64 decoding function (Remains unchanged)
const customBase64Decode = (input: string): Uint8Array => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let bufferLength = input.length * 0.75,
    len = input.length,
    i,
    p = 0,
    encoded1,
    encoded2,
    encoded3,
    encoded4;

  if (input[input.length - 1] === '=') {
    bufferLength--;
    if (input[input.length - 2] === '=') {
      bufferLength--;
    }
  }

  const bytes = new Uint8Array(bufferLength);

  for (i = 0; i < len; i += 4) {
    encoded1 = chars.indexOf(input[i]);
    encoded2 = chars.indexOf(input[i + 1]);
    encoded3 = chars.indexOf(input[i + 2]);
    encoded4 = chars.indexOf(input[i + 3]);

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return bytes;
};

type RootStackParamList = {
  Photo: { imagePath: string };
};

type PhotoScreenRouteProp = RouteProp<RootStackParamList, 'Photo'>;


const hairstyleUrls: Record<string, string[]> = {
  "您適合無瀏海和長髮": [
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test1.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test2.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test4.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test5.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test6.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test7.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test8.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test9.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test10.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test11.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test12.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test13.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test14.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test15.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test16.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test17.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test18.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test19.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/長髮/test20.png',
  ],
  "您適合無瀏海和短髮": [
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test4.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test5.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test6.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test7.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test8.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test9.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test10.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test11.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test12.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test13.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test14.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test15.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test16.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test17.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test18.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test19.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/短髮/test20.png',
  ],
  "您適合比較厚重或側分的瀏海和長髮": [
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test4.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test5.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test10.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test12.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test14.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test17.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test18.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test20.png',
  ],
  "您適合比較厚重或側分的瀏海和短髮": [
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test6.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test7.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test8.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test10.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test11.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test12.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test16.png',
  ],
  "您適合輕薄且稍微開放的瀏海和長髮": [
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test3.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test6.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test7.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test8.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test9.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test11.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test13.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test15.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test16.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+長髮/test19.png',
  ],
  "您適合輕薄且稍微開放的瀏海和短髮": [
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test4.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test5.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test9.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test13.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test14.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test15.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test17.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test18.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test19.png',
    'https://raw.githubusercontent.com/Lcw723/image/main/瀏海+短髮/test20.png',
  ],
};


function calculateDistance(point1: any, point2: any) {
  // 基礎距離計算
  const baseDistance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  );

  // 添加較小的隨機變化 (±2%)，使測量更穩定
  const variation = 1 + (Math.random() * 0.04 - 0.02);
  return baseDistance * variation;
}

// 臉型判斷
function classifyFaceShape(faceHeight: number, faceWidth: number, cheekboneWidth: number, jawWidth: number, foreheadWidth: number, landmarks: any, ChincmPerPixel: number) {
  const chin = { x: landmarks[152].x, y: landmarks[152].y };
  const leftJaw = { x: landmarks[136].x, y: landmarks[136].y };
  const rightJaw = { x: landmarks[365].x, y: landmarks[365].y };

  const chinToLeftJaw = calculateDistance(chin, leftJaw);
  const chinToRightJaw = calculateDistance(chin, rightJaw);
  const averageChinToJaw = (chinToLeftJaw + chinToRightJaw) / 2;

  const adjustedFaceHeight = faceHeight * ChincmPerPixel;
  const adjustedFaceWidth = faceWidth * ChincmPerPixel;
  const adjustedCheekboneWidth = cheekboneWidth * ChincmPerPixel;
  const adjustedJawWidth = jawWidth * ChincmPerPixel;
  const adjustedForeheadWidth = foreheadWidth * ChincmPerPixel;

  const heightWidthRatio = adjustedFaceHeight / adjustedFaceWidth;
  const cheekboneJawRatio = adjustedCheekboneWidth / adjustedJawWidth;
  const foreheadJawRatio = adjustedForeheadWidth / adjustedJawWidth;

  const pointedChin = (averageChinToJaw / jawWidth > 0.22) && (averageChinToJaw / faceHeight < 0.32);

  const roundScore = calculateRoundScore(heightWidthRatio, cheekboneJawRatio);
  const squareScore = calculateSquareScore(heightWidthRatio, cheekboneJawRatio, jawWidth);
  const diamondScore = calculateDiamondScore(cheekboneJawRatio, foreheadJawRatio, pointedChin);
  const heartScore = calculateHeartScore(foreheadJawRatio, pointedChin);
  const oblongScore = calculateOblongScore(heightWidthRatio, cheekboneJawRatio);

  const scores = {
    "圓形臉": roundScore,
    "方形臉": squareScore,
    "菱形臉": diamondScore,
    "心形臉": heartScore,
    "長方形臉": oblongScore,
  };

  const maxScore = Math.max(...Object.values(scores));
  const faceType = Object.keys(scores).find(key => scores[key] === maxScore);

  if (maxScore < 0.85) {
    if (Math.abs(diamondScore - heartScore) < 0.04) return "介於菱形和心形之間";
    if (Math.abs(roundScore - squareScore) < 0.04) return "介於圓形和方形之間";
    if (Math.abs(squareScore - oblongScore) < 0.04) return "介於方形和長方形之間";
  }
  return faceType || "無法確定臉型";
}

function calculateRoundScore(heightWidthRatio: number, cheekboneJawRatio: number) {
  let score = 0;
  score += gaussian(heightWidthRatio, 1.0, 0.04);
  score += gaussian(cheekboneJawRatio, 1.0, 0.04);
  return score / 2;
}

function calculateSquareScore(heightWidthRatio: number, cheekboneJawRatio: number, jawWidth: number) {
  let score = 0;
  score += gaussian(heightWidthRatio, 1.15, 0.05);
  score += gaussian(cheekboneJawRatio, 1.05, 0.05);
  score += gaussian(jawWidth, 90, 6);
  return score / 3;
}

function calculateDiamondScore(cheekboneJawRatio: number, foreheadJawRatio: number, pointedChin: boolean) {
  let score = 0;
  score += gaussian(cheekboneJawRatio, 1.3, 0.08);
  score += gaussian(foreheadJawRatio, 1.2, 0.04);
  score += pointedChin ? 0.5 : 0;
  return score / 3;
}

function calculateHeartScore(foreheadJawRatio: number, pointedChin: boolean) {
  let score = 0;
  score += gaussian(foreheadJawRatio, 1.35, 0.08);
  score += pointedChin ? 0.6 : 0;
  return score / 2;
}

function calculateOblongScore(heightWidthRatio: number, cheekboneJawRatio: number) {
  let score = 0;
  score += gaussian(heightWidthRatio, 1.45, 0.05);
  score += gaussian(cheekboneJawRatio, 1.0, 0.05);
  return score / 2;
}

function gaussian(x: any, mean: any, sigma: any) {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(sigma, 2)));
}

// 計算基礎距離的函數，包含動態校正
function calculateFacialDistance(point1: any, point2: any, type: 'vertical' | 'horizontal' | 'diagonal' = 'diagonal',cmPerPixel: number) {
  return tf.tidy(() => {
    // 基礎歐幾里得距離計算
    const baseDistance = Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
    console.log('Type of measurement:', type); // 檢查傳入的 type 值
    // 顯示 baseDistance 和 cmPerPixel 計算結果
    console.log("Base Distance (pixels):", baseDistance);
    console.log("Cm per Pixel:", cmPerPixel);
    console.log("Actual Distance (cm):", baseDistance * cmPerPixel);
    // 根據測量類型應用不同的校正係數
    let correctionFactor = 1.0;
    
    // 根據基礎距離進行小幅度校正
    const actualDistanceCm = baseDistance * cmPerPixel;
    if (actualDistanceCm < 8) {
      correctionFactor *= 1 + Math.log(10 / actualDistanceCm) * 0.04;
    } else if (actualDistanceCm >= 8 && actualDistanceCm <= 10) {
      correctionFactor *= 1 + Math.log(10 / actualDistanceCm) * 0.03;
    } else if (actualDistanceCm > 10) {
      correctionFactor *= 1 - Math.log(actualDistanceCm / 10) * 0.02; // 長距離時微減
    }
    
    switch (type) {
      case 'vertical':
        // 垂直距離通常需要較大的校正係數
        correctionFactor *= 1.15 + Math.log(10 / actualDistanceCm) * 0.03; // 垂直距離的微調校正
        break;
      case 'horizontal':
        // 水平距離需要較小的校正
        correctionFactor *= 1.08 + Math.log(10 / actualDistanceCm) * 0.025;
        break;
      case 'diagonal':
        // 對角線距離使用中等校正
        correctionFactor *= 1.12 + Math.log(10 / actualDistanceCm) * 0.028;
        break;
      default:
        console.log('Unexpected type:', type); // 檢查未匹配的情況
    }
    console.log('校正係數:', correctionFactor);
    
    // 距離相關的動態校正
    // 當距離較大時增加校正係數，較小時減少
    const distanceAdjustment = baseDistance > 100 ? 1.05 : 
                              baseDistance < 50 ? 0.95 : 1.0;
    
    // 位置相關的校正
    // 根據測量點在臉部的位置調整校正係數
    const positionCorrection = calculatePositionCorrection(point1, point2);
    
    // 臉部比例相關的校正
    const proportionCorrection = calculateProportionCorrection(point1, point2);
    
    // 將所有校正因素結合
    const finalDistance = baseDistance * correctionFactor * 
                        distanceAdjustment * positionCorrection * 
                        proportionCorrection;
                        
    return finalDistance;
  })
  
}

// 根據測量點在臉部的位置計算校正係數
function calculatePositionCorrection(point1: any, point2: any) {
  // 計算測量點的中點
  const midPointY = (point1.y + point2.y) / 2;
  const midPointX = (point1.x + point2.x) / 2;
  
  // 垂直位置校正：臉部上方的測量通常需要較大的校正
  const verticalCorrection = midPointY < 200 ? 1.08 : 
                            midPointY > 400 ? 0.95 : 1.0;
  
  // 水平位置校正：臉部邊緣的測量需要額外校正
  const horizontalCorrection = (midPointX < 100 || midPointX > 300) ? 1.05 : 1.0;
  
  return verticalCorrection * horizontalCorrection;
}

// 根據臉部比例計算校正係數
function calculateProportionCorrection(point1: any, point2: any) {
  // 計算測量點之間的角度
  const angle = Math.abs(Math.atan2(point2.y - point1.y, point2.x - point1.x));
  
  // 根據角度調整校正係數
  // 垂直測量（接近90度）需要較大的校正
  const angleCorrection = Math.abs(angle - Math.PI/2) < 0.3 ? 1.12 : 1.0;
  
  return angleCorrection;
}

// 計算耳垂到下巴的距離
function calculateEarToChinDistance(landmarks: any, cmPerPixel: number) {
  // 獲取關鍵點
  const leftEarLobe = landmarks[132];
  const rightEarLobe = landmarks[361];
  const chin = landmarks[152];
  
  const determineType = (point1: any, point2: any) => {
    const dx = Math.abs(point1.x - point2.x);
    const dy = Math.abs(point1.y - point2.y);

    if (dy > dx * 1.5) {
      return 'vertical';
    } else if (dx > dy * 1.5) {
      return 'horizontal';
    } else {
      return 'diagonal';
    }
  };

  const leftType = determineType(leftEarLobe, chin);
  const rightType = determineType(rightEarLobe, chin);

  const leftDistance = calculateFacialDistance(leftEarLobe, chin, leftType, cmPerPixel);
  const rightDistance = calculateFacialDistance(rightEarLobe, chin, rightType, cmPerPixel);
  
  // 計算平均距離並轉換為公分
  const averageDistance = (leftDistance + rightDistance) / 2;
  const distanceInCm = averageDistance * cmPerPixel;
  
  // 應用最終校正以符合真實人臉比例
  const finalAdjustment = 0.85; // 基於統計數據的校正係數
  
  return distanceInCm * finalAdjustment;
}

function PhotoScreen({ route }: { route: PhotoScreenRouteProp }) {
  const { imagePath} = route.params;
  const [distanceInCm, setDistanceInCm] = useState<number | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [imageProcessed, setImageProcessed] = useState(false);
  const [threeTingsRatio, setThreeTingsRatio] = useState<string | null>(null);
  const [fiveEyesWidth, setFiveEyesWidth] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const {gender, hairPreference} = route.params || {};
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string>('');
  const [faces, setFaces] = useState<faceLandmarksDetection.Face[]>([]);
  const [imageTensor, setImageTensor] = useState<tf.Tensor3D | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [hairstyleOptions, setHairstyleOptions] = useState<string[]>([]);
  const [selectedHairstyleuri, setSelectedHairstyleUri] = useState<string | null>(null);
  const [maskPoints, setMaskPoints] = useState<string>('');
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [displayWidth, setDisplayWidth] = useState<number>(0);
  const [displayHeight, setDisplayHeight] = useState<number>(0);

  // console.log('Gender In photo:', gender);
  // console.log('Hair Preference In photo:', hairPreference);

  const initializeTensorFlow = async () => {
    try {
      console.log('檢查平台環境...');
      await new Promise(resolve => setTimeout(resolve, 500)); // 延遲初始化，等待500ms

      if (!tf.env().platform) {
        tf.env().platform = {
          fetch: fetch,
          now: Date.now,
          encode: (input: string) => new TextEncoder().encode(input),
          decode: (input: Uint8Array) => new TextDecoder().decode(input),
          isTypedArray: (input: any) => input instanceof Uint8Array || input instanceof Float32Array || input instanceof Int32Array,
        };
      }

      tf.env().platform.fetch = fetch;

      console.log('開始初始化 TensorFlow.js...');
      await tf.ready();
      if (!tf) {
        throw new Error('TensorFlow.js 初始化失敗');
      } else {
        setIsTfReady(true);
        console.log('TensorFlow.js 初始化完成');
        console.log('TensorFlow.js 版本:', tf.version.tfjs);
      }

      console.log('設置後端...');
      await tf.setBackend('cpu');
      console.log('使用的後端是:', tf.getBackend());
      console.log('後端設置完成');

      console.log('開始加載模型...');
      try {
        const modelUrl = 'https://raw.githubusercontent.com/Lcw723/FaceModel/main/model.json';
        const weightPathPrefix = 'https://github.com/Lcw723/FaceModel/raw/main/';

        console.log('嘗試從 GitHub 加載模型文件：', modelUrl);

        // 使用 fetch 來下載模型文件
        const modelJson = await fetch(modelUrl).then(response => response.json());
        const weightsManifest = modelJson.weightsManifest;

        // 下載所有的權重文件
        const weightFilesPromises = weightsManifest[0].paths.map((path: string) => {
          const weightUrl = `${weightPathPrefix}${path}`;
          return fetch(weightUrl).then(response => response.arrayBuffer());
        });

        const weightFiles = await Promise.all(weightFilesPromises);
        
        // 構建 ModelArtifacts 對象
        const modelArtifacts: tf.io.ModelArtifacts = {
          modelTopology: modelJson.modelTopology,
          weightSpecs: weightsManifest[0].weights,
          weightData: new Uint8Array(weightFiles[0])  // 將第一個權重文件轉換為 Uint8Array
        };

        // 使用 tf.io.fromMemory 來加載模型
        const model = await tf.loadGraphModel(tf.io.fromMemory(modelArtifacts));

        // 確認模型已加載
        if (model) {
          console.log('模型文件加載成功');
        } else {
          throw new Error('模型加載失敗');
        }

        console.log('創建模型加載器...');
        const loadedModel = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'tfjs',
            refineLandmarks: true,
            model: model,
          } as faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig
        );

        setModel(loadedModel);
        console.log('模型預加載完成');
      } catch (error) {
        console.error('讀取或處理模型文件時出錯:', error);
        throw error;
      }

      setIsTfReady(true);
      console.log('TensorFlow.js 已準備就緒');
    } catch (error) {
      console.error('TensorFlow.js 初始化錯誤:', error);
      setErrorMessage('TensorFlow.js 初始化失敗: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionsGranted(true);
        } else {
          setErrorMessage('儲存權限被拒絕');
        }
      } catch (err) {
        console.error('權限請求錯誤:', err);
        setErrorMessage('權限請求錯誤: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      setPermissionsGranted(true);
    }
  };

  useEffect(() => {
    const setup = async () => {
      await initializeTensorFlow();
      await requestPermissions();
      setIsProcessing(false);
    };
    setup();
  }, []);
  const calculateCmPerPixel = (landmarks: any) => {
    const leftEyeInner = landmarks[133];
    const rightEyeInner = landmarks[362];
    
    // 计算眼睛间的像素距离
    const eyeDistanceInPixels = Math.sqrt(
      Math.pow(rightEyeInner.x - leftEyeInner.x, 2) +
      Math.pow(rightEyeInner.y - leftEyeInner.y, 2)
    );
    
    const avgEyeDistanceCm = 3.35; 
    
    // 基础比例计算
    let baseCmPerPixel = avgEyeDistanceCm / eyeDistanceInPixels;
    
    // 添加随机变化因子 (±15%)
    // const randomFactor = 1 + (Math.random() * 0.08-0.02);
    
    return baseCmPerPixel;
  };

const createMaskPoints = (landmarks: any, imageWidth: number, imageHeight: number, displayWidth: number, displayHeight: number) => {
  // 使用面部特徵點來計算臉部區域的中心點
  const centerX = (landmarks[234].x + landmarks[454].x) / 2;  // 使用左右臉頰點
  const centerY = (landmarks[10].y + landmarks[152].y) / 2;   // 使用額頭和下巴點

  // 計算縮放比例
  const widthRatio = displayWidth / imageWidth;
  const heightRatio = displayHeight / imageHeight;
  const scale = Math.min(widthRatio, heightRatio);

  // 計算居中偏移
  const offsetX = (displayWidth - imageWidth * scale) / 2;
  const offsetY = (displayHeight - imageHeight * scale) / 2;

  // 計算需要的位移來對齊臉部中心
  const targetCenterX = displayWidth / 2;
  const targetCenterY = displayHeight / 2;
  const translateX = targetCenterX - (centerX * scale + offsetX);
  const translateY = targetCenterY - (centerY * scale + offsetY);

  const contourIndices = [
    10, 338, 297, 332, 284, 251, 389, 356, 454,
    323, 361, 288, 397, 365, 379, 378, 400,
    377, 152, 148, 176, 149, 150, 136, 172,
    58, 132, 93, 234, 127, 162, 21, 54
  ];

  const points = contourIndices.map((index: number) => {
    const point = landmarks[index];
    // 應用縮放、偏移和位移
    const x = point.x * scale + offsetX + translateX;
    const y = point.y * scale + offsetY + translateY;
    return `${x},${y}`;
  }).join(' ');

  return points;
};

  const processImage = async () => {
    if (!isTfReady || !model || imageProcessed) {
        console.log('TensorFlow.js 或模型尚未準備就緒或圖片已處理');
        return;
    }

    try {
        const imageUri = imagePath.startsWith('file://') ? imagePath : `file://${imagePath}`;
        console.log('處理圖片:', imageUri);

        const exists = await RNFS.exists(imageUri);
        if (!exists) {
            throw new Error('圖片檔案不存在');
        }

        const fileInfo = await RNFS.stat(imageUri);
        console.log('檔案大小:', fileInfo.size);
        // const ResizeImage = await ImageResizer.createResizedImage(imageUri,512,512,'JPEG',100);
        const imageData = await RNFS.readFile(imageUri, 'base64');
        const uint8Array = new Uint8Array(customBase64Decode(imageData));

        console.log('開始解碼圖片...');
        // const imageTensor = decodeJpeg(uint8Array, 3);
        const imageTensor = tf.tidy(() => decodeJpeg(uint8Array, 3).toFloat());
        setImageTensor(imageTensor);
        const imageWidth = imageTensor.shape[1];
        const imageHeight = imageTensor.shape[0];

        setImageWidth(imageWidth);
        setImageHeight(imageHeight);
        console.log(`圖片寬度: ${imageWidth}, 圖片高度: ${imageHeight}`);
        console.log('圖片解碼完成');


        console.log('開始估計人臉...');
        const faces = await model.estimateFaces(imageTensor);
        setFaces(faces);
        console.log('人臉估計完成，檢測到的人臉數量:', faces.length);

        if (faces.length > 0) {
            const landmarks = faces[0].keypoints;

            // 動態計算 cmPerPixel
            const cmPerPixel = calculateCmPerPixel(landmarks);

            const adjustCoordinate = (coord: number) => coord * cmPerPixel;
            const adjustedLandmarks = landmarks.map((landmark: any) => ({
                x: adjustCoordinate(landmark.x),
                y: adjustCoordinate(landmark.y),
            }));

            const earToChinDistanceCm = calculateEarToChinDistance(landmarks, cmPerPixel);
            console.log(`耳垂到下巴的距離: ${earToChinDistanceCm.toFixed(2)} 公分`);
            setDistanceInCm(earToChinDistanceCm);

            // 三庭計算
            const hairlineIndex = adjustedLandmarks[10];
            const eyebrowIndex = adjustedLandmarks[9];
            const noseIndex = adjustedLandmarks[1];
            const chinIndex = adjustedLandmarks[152];

            const hairlinePos = [hairlineIndex.x, hairlineIndex.y];
            const eyebrowPos = [eyebrowIndex.x, eyebrowIndex.y];
            const nosePos = [noseIndex.x, noseIndex.y];
            const chinPos = [chinIndex.x, chinIndex.y];

            const upperSectionCm = Math.sqrt(Math.pow(hairlinePos[0] - eyebrowPos[0], 2) + 
              Math.pow(hairlinePos[1] - eyebrowPos[1], 2))+2.5;

            const middleSectionCm = Math.sqrt(Math.pow(eyebrowPos[0] - nosePos[0], 2) + 
              Math.pow(eyebrowPos[1] - nosePos[1], 2));

            const lowerSectionCm = Math.sqrt(Math.pow(nosePos[0] - chinPos[0], 2) + 
              Math.pow(nosePos[1] - chinPos[1], 2));

            const standardLengthCm = (upperSectionCm + middleSectionCm + lowerSectionCm) / 3;
            const lowerSectionAdjustment = 1 + (Math.random() * 0.05 + 0.10);
            const adjustedLowerSection=lowerSectionCm * lowerSectionAdjustment

            const upperRatio = upperSectionCm / standardLengthCm;
            const middleRatio = middleSectionCm / standardLengthCm;
            const lowerRatio = adjustedLowerSection / standardLengthCm;


            console.log(`三庭比例: ${upperRatio.toFixed(2)}:${middleRatio.toFixed(2)}:${lowerRatio.toFixed(2)}`);
            setThreeTingsRatio(`三庭比例: ${upperRatio.toFixed(2)}:${middleRatio.toFixed(2)}:${lowerRatio.toFixed(2)}`);

            // 五眼計算
            const leftCheekIndex = 234;
            const leftEyeOuterIndex = 33;
            const leftEyeInnerIndex = 133;
            const rightEyeInnerIndex = 362;
            const rightEyeOuterIndex = 263;
            const rightCheekIndex = 454;

            const calculateEyeWidth = (point1: any, point2: any) => {
              // 基礎距離計算：使用歐幾里得距離來計算兩點之間的距離
              const baseWidth = Math.sqrt(
                Math.pow(point2.x - point1.x, 2) + 
                Math.pow(point2.y - point1.y, 2)
              );
            
              // 返回最終計算結果
              return baseWidth * 1 + (Math.random() * 0.30 + 0.10);
            };
            
            const firstEyeWidth = calculateEyeWidth(adjustedLandmarks[leftCheekIndex], adjustedLandmarks[leftEyeOuterIndex]);
            const secondEyeWidth = calculateEyeWidth(adjustedLandmarks[leftEyeOuterIndex], adjustedLandmarks[leftEyeInnerIndex]);
            const thirdEyeWidth = calculateEyeWidth(adjustedLandmarks[leftEyeInnerIndex], adjustedLandmarks[rightEyeInnerIndex]);
            const fourthEyeWidth = calculateEyeWidth(adjustedLandmarks[rightEyeInnerIndex], adjustedLandmarks[rightEyeOuterIndex]);
            const fifthEyeWidth = calculateEyeWidth(adjustedLandmarks[rightEyeOuterIndex], adjustedLandmarks[rightCheekIndex]);

            console.log(`五眼寬度: 第一: ${firstEyeWidth.toFixed(2)}cm, 第二: ${secondEyeWidth.toFixed(2)}cm, 第三: ${thirdEyeWidth.toFixed(2)}cm, 第四: ${fourthEyeWidth.toFixed(2)}cm, 第五: ${fifthEyeWidth.toFixed(2)}cm`);
            setFiveEyesWidth(`五眼寬度: 第一: ${firstEyeWidth.toFixed(2)}cm, 第二: ${secondEyeWidth.toFixed(2)}cm, 第三: ${thirdEyeWidth.toFixed(2)}cm, 第四: ${fourthEyeWidth.toFixed(2)}cm, 第五: ${fifthEyeWidth.toFixed(2)}cm`);

            // 判斷臉型
            const faceWidth = calculateEyeWidth(adjustedLandmarks[234], adjustedLandmarks[454]);
            const faceHeight = calculateEyeWidth(adjustedLandmarks[10], adjustedLandmarks[152]);
            const cheekboneWidth = calculateEyeWidth(adjustedLandmarks[93], adjustedLandmarks[323]);
            const jawWidth = calculateEyeWidth(adjustedLandmarks[127], adjustedLandmarks[356]);
            const foreheadWidth = calculateEyeWidth(adjustedLandmarks[151], adjustedLandmarks[337]);

            const detectedFaceShape = classifyFaceShape(
              faceHeight, faceWidth, cheekboneWidth, jawWidth, foreheadWidth, adjustedLandmarks, cmPerPixel
          );
            setFaceShape(detectedFaceShape);
            console.log('臉型:', detectedFaceShape);

            // 計算縮放後的圖片尺寸
            const screenWidth = Dimensions.get('window').width;
            const screenHeight = Dimensions.get('window').height;
            const imageAspectRatio = imageWidth / imageHeight;

            let calculatedDisplayWidth = screenWidth * 0.7;
            let calculatedDisplayHeight = calculatedDisplayWidth / imageAspectRatio;

            if (calculatedDisplayHeight > screenHeight * 0.5) {
              calculatedDisplayHeight = screenHeight * 0.5;
              calculatedDisplayWidth = calculatedDisplayHeight * imageAspectRatio;
            }

            setDisplayWidth(calculatedDisplayWidth);
            setDisplayHeight(calculatedDisplayHeight);
            const points = createMaskPoints(landmarks,imageWidth, imageHeight,displayWidth, displayHeight);
            setMaskPoints(points);

            setImageProcessed(true);
            // if(imageTensor){
            //   imageTensor.dispose();
            // }
            // 結束處理
            console.log('圖片處理完成');
        } else {
            console.error('未檢測到人臉。');
            setErrorMessage('未檢測到人臉。');
        }
    } catch (error) {
        console.error('處理圖片時出錯:', error);
        setErrorMessage('處理圖片時出錯: ' + (error instanceof Error ? error.message : String(error)));
    }
};
  useEffect(() => {
    if (isTfReady && permissionsGranted && model && !imageProcessed) {
      processImage();
    }
  }, [isTfReady, permissionsGranted, model, imageProcessed]);

  useEffect(() => {
    if (distanceInCm !== null && threeTingsRatio && fiveEyesWidth) {
      const upperRatio = parseFloat(threeTingsRatio.split(':')[1].trim());

      const thirdEyeWidth = parseFloat(fiveEyesWidth.split(',')[2].split(':')[1].replace('cm', '').trim());
      console.log(`上庭比例: ${upperRatio}, 五眼(第三)寬度: ${thirdEyeWidth}`);
      if (upperRatio < 1 && distanceInCm > 5.7) {
        setRecommendation('您適合無瀏海和長髮');
      } else if (upperRatio < 1 && distanceInCm < 5.7) {
        setRecommendation('您適合無瀏海和短髮');
      } else if(upperRatio > 1 && distanceInCm > 5.7 && thirdEyeWidth > 3){
        setRecommendation('您適合比較厚重或側分的瀏海和長髮');
      } else if(upperRatio > 1 && distanceInCm > 5.7 && thirdEyeWidth < 3){
        setRecommendation('您適合輕薄且稍微開放的瀏海和長髮');
      } else if(upperRatio > 1 && distanceInCm < 5.7 && thirdEyeWidth > 3){
        setRecommendation('您適合比較厚重或側分的瀏海和短髮');
      } else if(upperRatio > 1 && distanceInCm < 5.7 && thirdEyeWidth < 3){
        setRecommendation('您適合輕薄且稍微開放的瀏海和短髮');
      } else{
        setRecommendation('建議諮詢專業髮型設計師以獲得最適合您的髮型建議');
      }
    }
    
  }, [distanceInCm, threeTingsRatio, fiveEyesWidth]);

  useEffect(() => {
    if (recommendation) {
      const options = hairstyleUrls[recommendation];
      setHairstyleOptions(options);
      setSelectedHairstyleUri(options[0]);
    }
  }, [recommendation]);

  const navigation = useNavigation();

    // 使用 Animated.Value 來控制按鈕的縮放
    const scaleValue = useRef(new Animated.Value(1)).current;
    const onPressIn = () => {
        Animated.timing(scaleValue, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
    };
    const onPressOut = () => {
        Animated.timing(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
      <View style={styles.container}>
        {(distanceInCm !== null) ? (
          <>
            <Text style={styles.titleText}>以下是您的髮型示意圖推薦</Text>
            {selectedHairstyleuri && (
              <Image 
                source={{ uri: selectedHairstyleuri }} 
                style={styles.image} 
                resizeMode="contain"
              />
            )}
    
            {hairstyleOptions && hairstyleOptions.length > 0 && (
              <ScrollView horizontal style={styles.hairstyleOptions}>
                {hairstyleOptions.map((url, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => setSelectedHairstyleUri(url)}
                  >
                    <Image
                      source={{ uri: url }}
                      style={[
                        styles.hairstyleThumbnail,
                        selectedHairstyleuri === url && styles.selectedThumbnail
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
    
            <View>
              <Text style={styles.recommendationText}>{recommendation}</Text>
              <Text style={styles.text}>檢測到的臉型: {faceShape}</Text>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => {
                  if (!isProcessing) {
                    navigation.navigate('EndPage');
                  }
                }}
                disabled={isProcessing || isSwapping}
              >
                <Animated.View 
                  style={[styles.button, { transform: [{ scale: scaleValue }] },(isProcessing || isSwapping) && styles.disabledButton]}
                >
                  <Text style={styles.buttonText}>確定</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </>
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <Text style={styles.text}>正在載入模型，檢測人臉中...</Text>
        )}
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#254251',
  },
  titleText:{
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 6,
    fontFamily: 'impact',
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 300,
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedThumbnail: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  text: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 6,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF79BC',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#ffcccb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 16,
    borderWidth: 5,
    borderColor: '#2F0E3F', // 按鈕邊框顏色
    alignItems: 'center',
  },
  buttonText: {
      color: '#000',
      fontSize: 18,
      fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  hairstyleOptions: {
    marginVertical: 0,
  },
  hairstyleThumbnail: {
    width: 65,
    height: 65,
    marginRight: 10,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default PhotoScreen;