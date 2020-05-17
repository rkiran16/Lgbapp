import React from "react";
import { Platform, StyleSheet, Image as Img,
  Dimensions, ActivityIndicator, ScrollView,
  TouchableOpacity, TouchableNativeFeedback, FlatList } from "react-native";
// Galio components
import { Block, Text, theme } from "galio-framework";
// Argon themed components
import { Images, argonTheme } from "../constants/";
import { Image } from 'react-native-elements';
import { Icon } from "../components/";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Odb } from '../actionable';

const { width } = Dimensions.get("screen");
const androidPhone = () => Platform.OS === 'android';

const manageNumbers = data => {
  parseFloat(3.14159.toFixed(2));
  if(data >=999999999999){
    let rData = data/1000000000000;
    rData = parseFloat(rData.toFixed(2));
    return `${rData}T`;
  }
  else if(data >= 999999999) {
    let rData = data/1000000000;
    rData = parseFloat(rData.toFixed(2));
    return `${rData}B`;
  }
  else if(data >= 999999) {
    let rData = data/1000000;
    rData = parseFloat(rData.toFixed(2));
    return `${rData}M`;
  }
  else if(data >= 999) {
    let rData = data/1000;
    rData = parseFloat(rData.toFixed(2));
    return `${rData}K`;
  }
  else if(data <= 999) {
    return data;
  }
}

const ColumnGrid = props => {
    const { imgUrl, headerPress, type, titleLabel, userImg, userName, stype, bizname, onSelects } = props;
    let TouchableCmp = TouchableOpacity;
    const savedHandlers = manageNumbers(parseInt('6'));
    const savedHandler = `${savedHandlers} people are interested in this post`;
    const renderImageItem = ({item}) => (
      <Block style={{flex:1, alignItems:'center', width:"100%"}}>
        <Image
          PlaceholderContent={<ActivityIndicator />}
          placeholderStyle={{width:width-(theme.SIZES.BASE*2), height: 250, justifyContent:'center', alignItems:'center'}}
          resizeMode='cover'
          source={{ uri: Odb.dbUrl+item }}
          containerStyle={{ width:width-(theme.SIZES.BASE*2), height: 250 }}
        />
      </Block>
    )
    if (Platform.OS === 'android' && Platform.Version >= 5) {
        TouchableCmp = TouchableNativeFeedback;
    }

    return (
      <Block style={styles.group}>
      <Block>
        <Block row style={{justifyContent: 'space-between', paddingHorizontal:10 }}>
          <Block row flex={1.3} style={{width: width - theme.SIZES.BASE * 10}}>
            <Block middle center style={styles.avatarContainer}>
              <Img
                source={{ uri: userImg || Images.ProfilePicture }}
                style={styles.avatar}
              />
            </Block>
            <Block style={{justifyContent:'center'}}>
            <Text size={10} style={{color: argonTheme.COLORS.BLACKS}}>{stype}</Text>
            <Text size={14} style={{color: argonTheme.COLORS.ICON}}>{userName || null}</Text>
            </Block>
          </Block>
          <Block flex={0.7} style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            {
              type === 'owner' ?
              <TouchableCmp onPress={headerPress}>
                <AntDesign
                style={{marginRight: 10}}
                name='ellipsis1'
                size={40}
                color= {argonTheme.COLORS.GRADIENT_START}
                style={{fontWeight: 800}}
                />
              </TouchableCmp>
              :
              <TouchableCmp onPress={headerPress}>
                <Text size={12} style={{color: argonTheme.COLORS.SUCCESS, fontWeight: '500'}}>CHAT</Text>
              </TouchableCmp>
            }
          </Block>
        </Block>
        <Block style={{zIndex:90000}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled={true}>
            {
              imgUrl.map(el => 
                <Image key={el}
                  PlaceholderContent={<ActivityIndicator />}
                  placeholderStyle={{width:width-(theme.SIZES.BASE*2), height: 250, justifyContent:'center', alignItems:'center'}}
                  resizeMode='cover'
                  source={{ uri: Odb.dbUrl+el }}
                  containerStyle={{ width:width-(theme.SIZES.BASE*2), height: 250 }}
                />
              )
            }
          </ScrollView>
          <Block middle row style={{position:'absolute', bottom:3, right:4,}}>
            {
              imgUrl.length > 1 ?  
              <MaterialCommunityIcons
                name={`numeric-${imgUrl.length}-box-multiple-outline`}
                size={25}
                color={argonTheme.COLORS.PRIMARY}
              /> : null
            }
          </Block> 
        </Block>
        <TouchableCmp onPress={onSelects}>
        {
          type === 'owner' ?
          <Block column style={{ paddingHorizontal:10 }}>
          <Block style={{marginTop:10, marginBottom:0}}>
            <Text size={16} style={{fontFamily:'bold', color: argonTheme.COLORS.ICON,}}>{titleLabel || null}</Text>
            {
              savedHandlers <= 0 ? null :
            <TouchableCmp shadowless style={{...styles.categoryBtn, marginTop:5}}>
              <Block row style={{...styles.categoryBtn, alignItems:'center'}} space='space-between'>
                <Block style={{marginRight:6}}>
                  <Icon
                    name="like1"
                    family="AntDesign"
                    size={20}
                    color= {argonTheme.COLORS.PRIMARY}
                  />
                  </Block>
                  <Text size={15} style={{...styles.textFont, color: argonTheme.COLORS.PRIMARY}}>{ savedHandler }</Text>
              </Block>
            </TouchableCmp>
            }
          </Block>
          <Block style={{marginTop:16}}>
            <Block row> 
              <Text bold size={15} style={{fontFamily:'bold', color:'#828282', marginRight:6}}>tholulomo</Text>
              <Text size={15} style={{...styles.textFont, color:'#828282'}}>@longy I hate this product</Text>
            </Block>
            <Block row space='between' style={{marginTop: 8}}>
              <TouchableCmp shadowless style={{...styles.categoryBtn, width:width*0.4}}>
                <Text bold size={15} style={{fontFamily:'bold', color:argonTheme.COLORS.PRIMARY}}>{null}</Text>
              </TouchableCmp>
              <TouchableCmp shadowless style={{...styles.categoryBtn, width:width*0.4, alignItems:'flex-end'}} onPress={onSelects}>
                <Text bold size={15} style={{fontFamily:'bold', color:argonTheme.COLORS.PRIMARY}}>See Post Details</Text>
              </TouchableCmp>
            </Block>
          </Block>
        </Block>
        :
        <Block column style={{paddingHorizontal: 10}} >
          <Block style={{marginTop:10, marginBottom:0}}>
            <TouchableCmp onPress={onSelects}>
              <Text size={16} style={{fontFamily:'bold', color: argonTheme.COLORS.ICON,}}>{titleLabel || null}</Text>
            </TouchableCmp>
            <TouchableCmp shadowless style={{...styles.categoryBtn, marginTop:5}} onPress={onSelects}>
              <Block row style={{...styles.categoryBtn, alignItems:'center'}} space='space-between'>
                <Block style={{marginRight:10}}>
                  <Icon
                    name="shop"
                    family="Entypo"
                    size={20}
                    color= {argonTheme.COLORS.GRADIENT_START}
                  />
                  </Block>
                  <Text size={12} style={{...styles.textFont, color: argonTheme.COLORS.GRADIENT_START}}>{bizname || userName}</Text>
              </Block>
            </TouchableCmp>
          </Block>
          <Block style={{marginTop: Platform.OS==='android' ? 5 : -15, alignItems:'flex-end'}}>
              <TouchableCmp shadowless style={{backgroundColor:argonTheme.COLORS.GRADIENT_START, 
                height: 35, borderRadius: 5, padding: 10, width: Platform.OS==='android'? 80 : null}}>
                  <Text size={12} style={{...styles.textFont, color: argonTheme.COLORS.SECONDARY, }}>BOOK NOW</Text>
              </TouchableCmp>
            </Block>
            <Block flex row style={{...styles.rowRightSeperator, marginTop:10, marginBottom: 5, justifyContent: 'space-between'}}>
              <TouchableCmp shadowless flex={1} style={{...styles.categoryBtn, width:'auto', marginRight: 14}}>
                <Block row style={{...styles.categoryBtn, width:'auto', alignItems:'center'}} space='space-between'>
                  <Block style={{marginRight:5}}>
                    <Icon
                      name="bookmark-border"
                      family="MaterialIcons"
                      size={20}
                      color= {argonTheme.COLORS.GRADIENT_START}
                    />
                    </Block>
                    <Text size={12} style={{...styles.textFont, color: argonTheme.COLORS.GRADIENT_START, }}>SAVE</Text>
                </Block>
              </TouchableCmp>
              <TouchableCmp shadowless flex={1} style={{...styles.categoryBtn, width:'auto', marginRight: 14}}>
                <Block row style={{...styles.categoryBtn, width:'auto', alignItems:'center'}} space='space-between'>
                  <Block style={{marginRight:5}}>
                    <Icon
                      name="message1"
                      family="AntDesign"
                      size={20}
                      color= {argonTheme.COLORS.GRADIENT_START}
                    />
                    </Block>
                    <Text size={12} style={{...styles.textFont, color: argonTheme.COLORS.GRADIENT_START,}}>COMMENT</Text>
                    <Block middle style={styles.notify} />
                </Block>
              </TouchableCmp>
              <TouchableCmp shadowless flex={1} style={{...styles.categoryBtn, width:'auto', marginTop:3, }}>
                <Block row style={{...styles.categoryBtn, width:'auto', alignItems:'center'}} space='space-between'>
                  <Text size={14} style={{...styles.textFont, color: argonTheme.COLORS.GRADIENT_START, marginRight:2}}>2.5</Text>
                  <Block>
                    <Icon
                      name="star"
                      family="EvilIcons"
                      size={20}
                      color= {argonTheme.COLORS.GRADIENT_START}
                    />
                    </Block>
                    <Text size={14} style={{...styles.textFont, color: argonTheme.COLORS.GRADIENT_START}}>Ratings</Text>
                </Block>
              </TouchableCmp>
            </Block>
        </Block>
        }
        </TouchableCmp>
      </Block>
    </Block>
    );
}

const styles = StyleSheet.create({
  group: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: argonTheme.COLORS.GREY,
    marginBottom: theme.SIZES.BASE/4,
    marginTop: theme.SIZES.BASE,
    width: '100%' //width
  },
  shadow: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.2,
    elevation: 2
  },
  categoryBtn: {
    backgroundColor: androidPhone ? 'transparent' : 'transparent',
    borderWidth: androidPhone ? null : 0,
    elevation: androidPhone ? 0 : 0,
    width:'100%',
    justifyContent: 'flex-start',
  },
  optionsButton: {
    width: "auto",
    height: 34,
    paddingHorizontal: theme.SIZES.BASE,
    paddingVertical: 10
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
  rowHandler: {
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    paddingHorizontal: theme.SIZES.BASE
  },
  rowRightSeperator: {
    padding:2, 
    flexWrap: 'wrap', 
  },
  textFont: {
    fontFamily: 'regular'
  },
  notify: {
    backgroundColor: argonTheme.COLORS.LABEL,
    borderRadius: 4,
    height: theme.SIZES.BASE / 2,
    width: theme.SIZES.BASE / 2,
    position: 'absolute',
    top: 2,
    left: 15,
  },
});

export default ColumnGrid;