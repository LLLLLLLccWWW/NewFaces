import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation } from '@react-navigation/native';
import firestore, { Timestamp } from '@react-native-firebase/firestore';

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigation = useNavigation();

  // 處理評分變更
  const handleRating = (newRating: any) => {
    setRating(newRating);
  };

  const writeFeedback = async () => {
    try {
      await firestore().collection('feedback').add({
        rating: rating,
        feedback: feedback,
        Timestamp: firestore.FieldValue.serverTimestamp(),
      });
      console.log('Feedback written successfully!');
      Alert.alert('感謝您的評論', '我們會繼續努力！', [
        { text: '確定', onPress: () => console.log('確定') },
      ]);
    } catch (error) {
      console.error('Error writing feedback:', error);
      Alert.alert('錯誤', '寫入資料庫失敗，請稍後再試。');
    }
  };

  const handleSubmit = () => {
    console.log('評分:', rating, '意見:', feedback);

    Alert.alert('感謝您的評論', '我們會繼續努力！', [
      { text: '確定', onPress: () => console.log('確定') },
    ]);

    writeFeedback();
    setFeedback('');
    setIsSubmitted(true);
  }
  const handleGoback = () => {
    navigation.navigate('EndPage');
  };
  return (
    <View style={styles.container}>
      {/* 上方Logo */}
      <Image source={{uri: 'https://raw.githubusercontent.com/Lcw723/image/main/logo.png'}} style={styles.logo} />
      {!isSubmitted ? (
          <>
            {/* 滿意度標題 */}
            <Text style={styles.title}>是否滿意此次體驗</Text>

            {/* 使用 AirbnbRating 顯示星級評分 */}
            <AirbnbRating
                count={5}
                reviews={['非常不滿意', '不滿意', '普通', '滿意', '非常滿意']}
                defaultRating={rating}
                size={30}
                onFinishRating={handleRating}
            />

            {/* 留言框 */}
            <TextInput
                style={styles.input}
                placeholder="留下您寶貴的意見"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={4}
                placeholderTextColor="#b0b0b0"
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>送出</Text>
            </TouchableOpacity>
          </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleGoback}>
            <Text style={styles.buttonText}>回上一頁</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#254251',  // 背景色設定
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
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
