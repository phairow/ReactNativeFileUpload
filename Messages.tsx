import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, ScrollView } from "react-native";
import { usePubNub } from 'pubnub-react';

const channel = 'awesomeChannel';
const channels = [channel];

export function Messages() {
  const pubnub = usePubNub();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  let messageList: ScrollView | null = null;

  useEffect(() => {
    pubnub.addListener({
      message: messageEvent => {
        setMessages([...messages, messageEvent.message]);
      },
    });

    pubnub.subscribe({ channels });
  }, [messages]);

  const sendMessage = useCallback(
    async message => {
      if (message) {
        await pubnub.publish({
          channel: channel,
          message,
        });

        setInput('');
      }
    },
    [pubnub, setInput]
  );

  return (
    <View>
      <Text style={styles.MessagesHeader}>Messages</Text>
      <ScrollView
        style={styles.MessagesList}  
        ref={ref => {messageList = ref}}
        onContentSizeChange={() => messageList ? messageList.scrollToEnd(): undefined}
      >
        { messages.length > 0 ?
          <View>
            {
              messages.map((message, messageIndex) => (
                <View
                  key={`message-${messageIndex}`}
                >
                  <Text>
                    {message}
                  </Text>
                </View>
              ))
            }
          </View>
        :
          <Text>No Messages</Text>
        }
      </ScrollView>
      <TextInput
        style={styles.MessagesInput}
        placeholder="Type your message"
        value={input}
        onChangeText={text => setInput(text)}
      />
      <Button
        title="Send Message"
        color="blue"
        onPress={e => {
            e.preventDefault();
            sendMessage(input);
        }}
        >
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  MessagesHeader: {
    backgroundColor: 'blue',
    color: 'white',
    textAlign: 'left'
  },
  MessagesList: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    height: 80
  },
  MessagesInput: {
    backgroundColor: 'white',
  }
});
  