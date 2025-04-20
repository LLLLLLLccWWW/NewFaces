import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CameraScreen from './Camera';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer , useNavigation } from '@react-navigation/native';
import { navigationRef, navigate } from './RootNavigation'; // 確保正確導入navigate

import PhotoScreen from './PhotoScreen'; // 確保正確導入PhotoScreen
import Homepage from './Homepage';
import Notice from './Notice';
import EndPage from './EndPage';
import FeedbackScreen from './Feedback';
import PreferencePage from './PreferencePage';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="Homepage" component={Homepage} options={{ headerShown: false }} />
        <Stack.Screen name="PreferencePage" component={PreferencePage} options={{ headerShown: false }} />
        <Stack.Screen name="Notice" component={Notice} options={{ headerShown: false }} />
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PhotoScreen" component={PhotoScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="EndPage" component={EndPage} options={{ headerShown: false }}/>
        <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
