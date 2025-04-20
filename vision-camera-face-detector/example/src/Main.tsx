import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './App';
import PhotoScreen from './PhotoScreen';
import { navigationRef } from './RootNavigation';
import Homepage from './Homepage';
import Notice from './Notice';
import EndPage from './EndPage';
import FeedbackScreen from './Feedback';
import PreferencePage from './PreferencePage';

const Stack = createStackNavigator();

export default function Main() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Homepage">
        <Stack.Screen name="Homepage" component={Homepage} />
        <Stack.Screen name="PreferencePage" component={PreferencePage} />
        <Stack.Screen name="Notice" component={Notice} />
        <Stack.Screen name="Camera" component={App} />
        <Stack.Screen name="PhotoScreen" component={PhotoScreen} />
        <Stack.Screen name="EndPage" component={EndPage} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
