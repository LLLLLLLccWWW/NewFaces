import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const EndPage = () => {
    const navigation = useNavigation();

    // 使用 Animated.Value 來控制按鈕的縮放
    const scaleValue = useRef(new Animated.Value(1)).current;
    const onPressIn = () => {
        Animated.timing(scaleValue, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };
    const onPressOut = () => {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    };

    // // 使用 Animated.Value 來控制照片的淡入淡出動畫
    // const opacityValue = useRef(new Animated.Value(0)).current;

    // // 使用 Animated.Value 來控制按鈕的移動動畫
    // const slideValue = useRef(new Animated.Value(-500)).current;

    // // 使用 Animated.Value 來控制按鈕的旋轉動畫
    // const rotateValue = useRef(new Animated.Value(0)).current;

    // // 在頁面獲得焦點時重新執行所有動畫
    // useFocusEffect(
    //     React.useCallback(() => {
    //         // 重置動畫值
    //         opacityValue.setValue(0);
    //         slideValue.setValue(-500);
    //         rotateValue.setValue(0);
            
    //         // 開始執行動畫
    //         Animated.timing(opacityValue, {
    //             toValue: 1, // 完全顯示
    //             duration: 2000, // 持續 2 秒
    //             useNativeDriver: true,
    //         }).start();

    //         Animated.timing(slideValue, {
    //             toValue: 0, // 移動到原始位置
    //             duration: 2000, // 持續 2 秒
    //             useNativeDriver: true,
    //         }).start();

    //         Animated.timing(rotateValue, {
    //             toValue: 2, // 旋轉 2 圈
    //             duration: 2000, // 持續 2 秒
    //             useNativeDriver: true,
    //         }).start();
    //     }, [opacityValue, slideValue, rotateValue])
    // );

    // const rotateInterpolation = rotateValue.interpolate({
    //     inputRange: [0, 2],
    //     outputRange: ['0deg', '720deg'],
    // });

    return (
        <View style={styles.container}>
            <Animated.Image 
                source={{ uri: 'https://raw.githubusercontent.com/Lcw723/image/main/logo.png' }}
                style={[styles.logo]}
            />
            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => navigation.navigate('Homepage')}
            >
                <Animated.View 
                    style={[styles.button, { transform: [{ scale: scaleValue }] }]}
                >
                    <Text style={styles.buttonText}>再測一次</Text>
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => navigation.navigate('Feedback')}
            >
                <Animated.View 
                    style={[styles.button, { transform: [{ scale: scaleValue }] }]}
                >
                    <Text style={styles.buttonText}>評論</Text>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

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
});

export default EndPage;
