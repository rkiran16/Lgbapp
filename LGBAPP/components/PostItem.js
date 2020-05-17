import React from 'react';
import { Image, Dimensions, ImageBackground, StyleSheet, ScrollView, ActivityIndicator,
  Platform, TouchableOpacity, TouchableNativeFeedback } from "react-native";
// Galio components
import { Block, Text, theme } from "galio-framework";
import { Image as Img, Rating } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Argon themed components
import { Images, argonTheme } from "../constants";
import Button from "./Button";
import Icon from "./Icon";
import { Odb } from '../actionable';
const { width } = Dimensions.get("screen");
const androidPhone = () => Platform.OS === 'android';

let TouchableCmp = TouchableOpacity;
if (Platform.OS === 'android' && Platform.Version >= 5) {
    TouchableCmp = TouchableNativeFeedback;
}

class PostItem extends React.Component {
  reviewAccum = (arr) => {
    if(!arr) {
      return 0;
    }
    if(arr){
      // const sum = arr.map( el => parseInt(el.review) ).reduce((a, b) => a + b, 0);
      const sums = arr.reviews/arr.users;
      return sums;
    }
    return 0;
  }
render() {
  const { item, onSelects, chatting, iSave, iComment, iLiked } = this.props;
    return (
      <Block style={styles.group}>
        <Block row style={{justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: theme.SIZES.BASE, height:50}}>
          <Block row style={{padding:2, flexWrap: 'wrap', width:width - theme.SIZES.BASE * 10}}>
            <Block middle center style={styles.avatarContainer}>
              <Image
                source={{ uri: Odb.dbUrl+item.creator.img[0] }}
                style={styles.avatar}
              />
            </Block>
            <Block style={{justifyContent:'center'}}>
              <Text size={10} style={{color: argonTheme.COLORS.BLACKS}}>{item.stype || 'Found'}</Text>
              <Text size={14} style={{color: argonTheme.COLORS.ICON}}>
                {!item.creator.bizname || item.creator.bizname === 'null' ? item.creator.displayName : item.creator.bizname}
              </Text>
            </Block>
          </Block>
          <TouchableCmp onPress={chatting} style={{padding:1, paddingLeft:5, borderColor:argonTheme.COLORS.GREY }}>
          <Block middle center style={{alignItems:'center', justifyContent:'center', flex: Platform.OS==='android'? null : 1}}>
            <Text size={12} style={{color: argonTheme.COLORS.SUCCESS, fontWeight: '500'}}>CHAT</Text>
          </Block>
          </TouchableCmp>
        </Block>
        <Block>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled={true}>
            {
              item.imageUrl.map(el => 
                <TouchableOpacity key={el} onPress={iLiked}>
                  <Img 
                    PlaceholderContent={<ActivityIndicator />}
                    placeholderStyle={{width:width, height: 342, justifyContent:'center', alignItems:'center'}}
                    resizeMode='cover'
                    source={{ uri: Odb.dbUrl+el }}
                    containerStyle={{ width:width, height: 342 }}
                  />
                </TouchableOpacity>
              )
            }
          </ScrollView>
          <Block middle row style={{position:'absolute', bottom:3, right:4,}}>
            {
              item.imageUrl.length > 1 ?  
              <MaterialCommunityIcons
                name={`numeric-${item.imageUrl.length}-box-multiple-outline`}
                size={25}
                color={argonTheme.COLORS.GRADIENT_END}
              /> : null
            }
          </Block> 
        </Block>
        <Block style={{paddingHorizontal: theme.SIZES.BASE, width:width}}>
          <Block row style={{marginTop:10, marginBottom:0}}>
            <Block flex={!item.button || item.button==='null' ? 1 : 0.6}>
                <Text size={16} style={{color: argonTheme.COLORS.ICON, fontFamily:'bold'}}>{item.title || 'N/A'}</Text>
                <Block>
                  <Text style={{fontFamily:'regular', color:'#999999', fontSize: 12}}>
                    {item.shortdesc || 'N/A'}
                  </Text>
                </Block>
            </Block>
            {
              !item.button || item.button==='null' ? null :
              <Block flex={0.4} style={{alignItems:'flex-end'}}>
                <Block>
                  <Button shadowless  style={{backgroundColor:argonTheme.COLORS.GRADIENT_START, 
                  alignSelf: "center", borderRadius: 10, width:'auto'}}>
                    <Block middle center style={{paddingVertical:2, paddingHorizontal:12, justifyContent:'center', alignItems:'center'}}>
                      <Text size={14} style={{color: argonTheme.COLORS.SECONDARY, fontFamily:'bold'}}>{item.button}</Text>
                    </Block>
                  </Button>
                </Block>
              </Block>
            }
          </Block>
          <Block row space='between' style={{marginTop:8}} >
            <TouchableOpacity onPress={iSave}>
              <Block row style={{...styles.categoryBtn, alignItems:'center'}} space='between'>
                <Block style={{marginRight:5}}>
                  <Icon
                    name="bookmark-border"
                    family="MaterialIcons"
                    size={29}
                    color= {argonTheme.COLORS.GRADIENT_END}
                  />
                  </Block>
                  <Text size={16} style={{color: '#999999', fontFamily: 'bold'}}>SAVE</Text>
              </Block>
            </TouchableOpacity>
            <TouchableOpacity onPress={iComment}>
              <Block row style={{...styles.categoryBtn,alignItems:'center'}} space='between'>
                <Block style={{marginRight:5}}>
                  <Icon
                    name="message1"
                    family="AntDesign"
                    size={29}
                    color= {argonTheme.COLORS.GRADIENT_END}
                  />
                </Block>
                <Text size={16} style={{color: '#999999', fontFamily:'bold'}}>COMMENTS</Text>
              </Block>
            </TouchableOpacity>
            <TouchableOpacity>
              <Block row style={{...styles.categoryBtn, alignItems:'center', justifyContent:'center', flex:1}} >
                {
                  !item.review || !item.review.reviews ? 
                  <Block row>
                    <Text size={18} style={{color: argonTheme.COLORS.GRADIENT_END, fontFamily:'bold', marginRight: 5}}>Ratings:</Text>
                    <Text size={20} style={{color: '#999999', fontFamily:'regular'}}>N/A</Text> 
                  </Block>:
                  <Rating
                    type='star'
                    ratingColor='#6B24AA'
                    ratingCount={5}
                    imageSize = {15}
                    startingValue={this.reviewAccum(item.review)}
                    readonly
                  />
                }
              </Block>
            </TouchableOpacity>

          </Block>
          {
            item.stype === 'null' || !item.stype ? null :
            <Block style={{marginTop:8, width}}>
              <TouchableOpacity style={{paddingVertical: 5}} onPress={onSelects}>
                <Text bold size={15} style={{fontFamily:'bold', color:argonTheme.COLORS.GRADIENT_END}}>See Post Details</Text>
              </TouchableOpacity>
            </Block>
          }
        </Block>
    </Block>
    );
  };
}

const styles = StyleSheet.create({
    group: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: argonTheme.COLORS.GREY,
      width: width,
      // marginBottom: 3, 
      marginTop: 0, 
      elevation: 2,
    },
    avatarContainer: {
        marginRight: 10,
        paddingBottom: 5
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 0
    },
    shadow: {
      shadowColor: "black",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 0.2,
      elevation: 2
    },
    categoryBtn: {
      backgroundColor: 'transparent',
      borderWidth: androidPhone ? null : 0,
      elevation: 0,
      marginRight:2
      //justifyContent: 'flex-start',
    },
})
export default PostItem;