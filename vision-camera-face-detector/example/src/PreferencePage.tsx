import React,{useState,useRef} from "react";
import {View,Text,TouchableOpacity,StyleSheet,Animated, Button,Dimensions} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const {height}=Dimensions.get("window");
const PreferencePage = () =>{

    const navigation = useNavigation();

    const [gender,setGender]=useState("female");
    const [hairPreference,setHairPreference]=useState("none");

    // 使用 Animated.Value 來控制照片的淡入淡出動畫
    const opacityValue = useRef(new Animated.Value(0)).current;

    // 使用 Animated.Value 來控制按鈕的移動動畫
    const slideValue = useRef(new Animated.Value(height)).current;

    // 使用 Animated.Value 來控制按鈕的旋轉動畫
    const rotateValue = useRef(new Animated.Value(0)).current;

    // 使用 Animated.Value 來控制按鈕的縮放
    const scaleValue = useRef(new Animated.Value(1)).current;

      // 在頁面獲得焦點時重新執行動畫
  useFocusEffect(
    React.useCallback(() => {
      // 重置動畫值
      opacityValue.setValue(0);
      slideValue.setValue(height);
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

    return(
        <View style={styles.container}>
            <Animated.Image
                source={{uri: 'https://raw.githubusercontent.com/Lcw723/image/main/logo.png'}}
                style={[styles.logo, {opacity: opacityValue}]}
            />
            {/* <Text style={styles.label}>
                性別
            </Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.optionButton,gender === 'male' && styles.selectedOption]}
                    onPress={() => setGender('male')}
                >
                    <Text style={styles.buttonText}>
                        {gender === 'male' ? '✓ 男' : '男'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.optionButton,gender === 'female' && styles.selectedOption]}
                    onPress={() => setGender('female')}
                >
                    <Text style={styles.buttonText}>
                        {gender === 'female' ? '✓ 女' : '女'}
                    </Text>
                </TouchableOpacity>
            </View> */}

            <Text style={styles.label}>
                偏好髮型
            </Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.optionButton,hairPreference === 'curly' && styles.selectedOption]}
                    onPress={() => setHairPreference('curly')}
                >
                    <Text style={styles.buttonText}>
                        {hairPreference === 'curly' ? '✓ 捲髮' : '捲髮'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.optionButton,hairPreference === 'straight' && styles.selectedOption]}
                    onPress={() => setHairPreference('straight')}
                >
                    <Text style={styles.buttonText}>
                        {hairPreference === 'straight' ? '✓ 直髮' : '直髮'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.optionButton,hairPreference === 'none' && styles.selectedOption]}
                    onPress={() => setHairPreference('none')}
                >
                    <Text style={styles.buttonText}>
                        {hairPreference === 'none' ? '✓ 無' : '無'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => navigation.navigate('Notice', { hairPreference })}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <Animated.View
                    style={[styles.button,{ transform: [{ scale: scaleValue }, { translateY: slideValue }, { rotate: rotateInterpolation }] }]}
                >
                    <Text style={styles.buttonText}>開始拍攝</Text>
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
        backgroundColor: '#254251',
    },
    logo: {
        width: 250,
        height: 200,
        marginBottom: 20,
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
    mainText: {
        fontSize: 20,
        color: '#ffffff',
        marginBottom: 40,
    },
    label: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 10,
        alignSelf: 'flex-start',
        marginLeft: 40,
      },
      row: {
        flexDirection: 'row',
        marginBottom: 20,
      },
      optionButton: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
        alignItems: 'center',
      },
      selectedOption: {
        backgroundColor: '#6a5acd', // 當選中時的背景色
      },
      optionText: {
        fontSize: 16,
        color: '#000000',
      },
      startButton: {
        backgroundColor: '#ffcccb',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginTop: 40,
        borderWidth: 2,
        borderColor: '#2F0E3F',
        alignItems: 'center',
      },
      startButtonText: {
        color: '#2F0E3F',
        fontSize: 18,
        fontWeight: 'bold',
      },
});

export default PreferencePage;