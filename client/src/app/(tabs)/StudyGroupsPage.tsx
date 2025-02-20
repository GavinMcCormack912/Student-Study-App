import { StyleSheet, Image, Platform } from 'react-native';
import { Text, View} from 'react-native';
import { Button } from 'react-native-paper';
import CustomText from '../../components/CustomText'
import TextInputExample from '../../components/TextInputExample'
import SimpleList from '../../components/SimpleList'
import Loading from '../../components/Loading' 
import { useState } from 'react';

export default function TabThreeScreen() {

  const [loading, setLoading]=useState(false);
  const [form, setForm]=useState(false);
  const [list, setList]=useState(false);

  function showComponent(title: string) {
    if(title == "loading") {
      setLoading(true)
    } else if(title == "form") {
      setForm(true)
    } else if(title == "list") {
      setList(true)
    } else if(title == "clear") {
      setLoading(false)
      setForm(false)
      setList(false)
    } else {
      setLoading(true)
      setForm(true)
      setList(true)
    }
  }

  return (
    <>
      <View>
      <Text style={styles.textStyle}>Study Groups Page</Text>
      </View>
      <View>
      <Button style={[styles.buttons,{backgroundColor:'red'}]} 
              textColor='white'
              labelStyle={{color:'white',fontSize: 20}}
              onPress={()=>showComponent('loading')}
              >
        Show Loading
      </Button>
      <Button style={[styles.buttons,{backgroundColor:'blue'}]} 
              textColor='white'
              labelStyle={{color:'white',fontSize: 20}}
              onPress={()=>showComponent('form')}
              >
        Show Form
      </Button>
      <Button style={[styles.buttons,{backgroundColor:'green'}]} 
              textColor='white'
              labelStyle={{color:'white',fontSize: 20}}
              onPress={()=>showComponent('list')}
              >
        Show List
      </Button>
      <Button style={[styles.buttons,{backgroundColor:'black'}]} 
              textColor='white'
              labelStyle={{color:'white',fontSize: 20}}
              onPress={()=>showComponent('all')}
              >
        Show All
      </Button>
      <Button style={[styles.buttons,{backgroundColor:'purple'}]} 
              textColor='white'
              labelStyle={{color:'white',fontSize: 20}}
              onPress={()=>showComponent('clear')}
              >
        Hide All
      </Button>
      </View>
      <View>
          {loading?<Loading/>:''}
          {form?<TextInputExample/>:''}
          {list?<SimpleList/>:''}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  textStyle:{
    fontSize:30,
    color: "black",
    textAlign: "center",
    marginTop:10
  },
  buttons: {
    width: '100%',
    borderRadius: 3,
    marginBottom: 10,

  }
});
