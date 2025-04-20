import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect,useRoute } from '@react-navigation/native';

export default function Notice() {
  const navigation = useNavigation();
  const route = useRoute();
  const { gender, hairPreference } = route.params || {};

  console.log('Gender:', gender);
  console.log('Hair Preference:', hairPreference);


  // 使用 Animated.Value 來控制照片的淡入淡出動畫
  const opacityValue = useRef(new Animated.Value(0)).current;

  // 使用 Animated.Value 來控制按鈕的移動動畫
  const slideValue = useRef(new Animated.Value(500)).current;

  // 使用 Animated.Value 來控制按鈕的旋轉動畫
  const rotateValue = useRef(new Animated.Value(0)).current;

  // 使用 Animated.Value 來控制按鈕的縮放
  const scaleValue = useRef(new Animated.Value(1)).current;

  // 在頁面獲得焦點時重新執行動畫
  useFocusEffect(
    React.useCallback(() => {
      // 重置動畫值
      opacityValue.setValue(0);
      slideValue.setValue(500);
      rotateValue.setValue(0);

      // 照片淡入動畫
      Animated.timing(opacityValue, {
        toValue: 1, // 完全顯示
        duration: 2000, // 持續 2 秒
        useNativeDriver: true,
      }).start();

      // 按鈕移動動畫
      Animated.timing(slideValue, {
        toValue: 0, // 移動到原始位置
        duration: 2000, // 持續 2 秒
        useNativeDriver: true,
      }).start();

      // 按鈕旋轉動畫
      Animated.timing(rotateValue, {
        toValue: 2, // 旋轉 2 圈
        duration: 2000, // 持續 2 秒
        useNativeDriver: true,
      }).start();
    }, [opacityValue, slideValue, rotateValue])
  );

  const rotateInterpolation = rotateValue.interpolate({
    inputRange: [0, 2],
    outputRange: ['0deg', '720deg'],
  });

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* 頭像圖標 */}
      <Animated.Image
        source={{ uri: 'https://raw.githubusercontent.com/Lcw723/image/main/1.png' }}
        style={[styles.topImage, { opacity: opacityValue }]}
      />

      {/* 說明文字 */}
      <Animated.Text style={[styles.mainText, { opacity: opacityValue }]}>請直視鏡頭</Animated.Text>

      {/* 下面三個圖標和說明 */}
      <View style={styles.iconRow}>
        <Animated.Image
          source={{ uri: 'https://raw.githubusercontent.com/Lcw723/image/main/2.png' }}
          style={[styles.icon, { opacity: opacityValue }]}
        />
        <Animated.Text style={[styles.iconText, { opacity: opacityValue }]}>多人入鏡</Animated.Text>
      </View>

      <View style={styles.iconRow}>
        <Animated.Image
          source={{ uri: 'https://raw.githubusercontent.com/Lcw723/image/main/3.png' }}
          style={[styles.icon, { opacity: opacityValue }]}
        />
        <Animated.Text style={[styles.iconText, { opacity: opacityValue }]}>側面</Animated.Text>
      </View>

      <View style={styles.iconRow}>
        <Animated.Image
          source={{ uri: 'https://raw.githubusercontent.com/Lcw723/image/main/4.png' }}
          style={[styles.icon, { opacity: opacityValue }]}
        />
        <Animated.Text style={[styles.iconText, { opacity: opacityValue }]}>頭髮覆蓋</Animated.Text>
      </View>

      {/* 使用 TouchableOpacity 作為確認按鈕 */}
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => navigation.navigate('Camera',{gender,hairPreference})}
      >
        <Animated.View
          style={[
            styles.confirmButton,
            { transform: [{ scale: scaleValue }, { translateX: slideValue }, { rotate: rotateInterpolation }] },
          ]}
        >
          <Text style={styles.buttonText}>確定</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1d4159',
  },
  topImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  mainText: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 40,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  confirmButton: {
    marginTop: 40,
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
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
