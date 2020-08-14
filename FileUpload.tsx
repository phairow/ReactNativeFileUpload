import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Image } from "react-native";
import { usePubNub } from 'pubnub-react';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

const channel = 'awesomeChannel';

export function FileUpload() {
  const pubnub: any = usePubNub(); // pubnub as any to avoid missing type defs for file upload (they are coming soon)
  const [ imageId, setImageId ] = useState('');
  const [ imageUp, setImageUp ] = useState('');
  const [ imageDown, setImageDown ] = useState('');
  const [ uploading, setUploading ] = useState(false);
  const [ downloading, setDownloading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ fileUploadResult, setFileUploadResult ] = useState('');

  let getPermissionAsync = async () => {
    if (Constants.platform && Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  let pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: .1,
      });

      console.log('pick image');
      // console.log(JSON.stringify(result));

      if (!result.cancelled) {
       setImageUp(result.uri);
      }

      setError('none');
    } catch (e) {
      setError(e.message);
    }
  };

  let uploadImage = async () => {
    try {
      setUploading(true);

      const result = await pubnub.sendFile({
        channel: channel,
        message: { test: 'message', value: 42 },
        file: {
          uri: imageUp,
          name: 'myFile2.jpg',
          mimeType: 'image/jpeg',
        },
      });

      setUploading(false);
      setImageId(result.id);
      setFileUploadResult(JSON.stringify(result));
    } catch (e) {
      let errorMessage = e + ' -- ' + JSON.stringify(e);

      console.log(errorMessage);

      setUploading(false);
      setError(errorMessage);
      setImageId('');
      setFileUploadResult('');
    }

  };

  let downloadImage = async () => {
    try {
      console.log('id', imageId);

      setDownloading(true);

      const result =  await pubnub.downloadFile({
          channel: 'awesomeChannel',
          id: imageId,
          name: 'myFile2.jpg'
      });

      let fileContent = await result.toBlob();
  
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        setImageDown('' + reader.result);
        setDownloading(false);
      }, false);

      reader.addEventListener("error", (e) => {
        console.log(e);
        setDownloading(false);
      }, false);
    
      reader.readAsDataURL(fileContent);
    } catch (e) {
      console.log(e);
      setDownloading(false);
      setError(e.message);
    }
  };
  
  useEffect(() => {
    getPermissionAsync();
  }, []);

  return (
    <View>
    <Text style={styles.FileHeader}>File Upload</Text>
      <View>
        <Button title="Pick an image from camera roll" onPress={pickImage} >Pick Image</Button>
      </View>
      { imageUp ? 
          <View>
            <Text>Image To Upload</Text>
            <Image style={styles.Image} source={{uri: imageUp}} />
            <Text>{imageUp}</Text>
            <Button title="Updload to PubNub" onPress={uploadImage} >Upload Image</Button>
            <Text>Upload Result</Text>
            {
              uploading ?
                <Text>Uploading ...</Text>
              :
                <Text>{ fileUploadResult }</Text>
            }
            {
              fileUploadResult ? 
                <View>
                  <Button
                    title="Download File"
                    onPress={e => {
                        e.preventDefault();
                        downloadImage();
                    }}
                  >
                  </Button>
                  {
                    downloading ?
                      <Text>Downloading ...</Text>
                    :
                      undefined 
                  }
                  {
                    imageDown ?
                      <View>
                      <Text>Image Downloaded</Text>
                        <Image style={styles.Image} source={{uri: imageDown}} />
                        <Text>DataURL</Text>
                        <Text>{imageDown.substr(0,100)} ... </Text>
                      </View>
                    :
                      undefined 
                  }
                </View>
              :
                undefined
            }
          </View>
        :
          undefined
      }
      <Text>&nbsp;</Text>
      <Text>File Error:</Text>
      <Text>{ error }</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  FileHeader: {
    backgroundColor: 'blue',
    color: 'white',
    textAlign: 'left'
  },
  Image: {
    width: 200,
    height: 200
  }
});
