import React from 'react';
import { StyleSheet, ScrollView, View, Text, } from "react-native";
import Pubnub from 'pubnub';
import { PubNubProvider } from 'pubnub-react';
import { Messages } from './Messages';
import { FileUpload } from './FileUpload';

const pubnub = new Pubnub({
  publishKey: 'pub-c-10921688-79ed-4759-b6e2-4388eed57ffe',
  subscribeKey: 'sub-c-bc7c86ac-8ff9-11ea-9dd4-caf89c7998a9',
});

const channels = ['awesomeChannel'];

export default function App() {
  return (
    <PubNubProvider client={pubnub}>
      <Text style={styles.Heading}>React Chat Example + File Upload</Text>
      <ScrollView style={styles.Scroll}>
        <View style={styles.App}>
          <Messages />
          <FileUpload />
        </View>
      </ScrollView>
    </PubNubProvider>
  );
}

const styles = StyleSheet.create({
  Heading: {
    marginTop: 20,
    backgroundColor: 'grey',
    color: 'white'
  },
  Scroll: {
    backgroundColor: 'lightgrey',
  },
  App: {
    backgroundColor: 'lightgrey',
    marginBottom: 80
  }
});
