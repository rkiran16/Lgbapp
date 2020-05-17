import React from 'react';
import { Platform, ActivityIndicator, TouchableOpacity, StyleSheet, FlatList, RefreshControl } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Image, Avatar, Button, ListItem, SearchBar, Overlay } from 'react-native-elements';
import DatePicker from 'react-native-datepicker'
import moment from 'moment';
import { Block, Text, theme } from 'galio-framework';
import FInput from './FormInput'
import { Images, argonTheme } from "../constants";
import { Odb } from "../actionable";
import { Ionicons, MaterialCommunityIcons, Foundation, EvilIcons } from '@expo/vector-icons';
import {  width }  from '../constants/utils'

const listChecker = x => {
    let list=[];
    if(x && x.length > 0 && !x[0].label){
        x.map(el => list.push({label: el.name, value:el._id}));
        return list;
    }
    return x;
}

export const Selector = props => {
    const { onChange, listing, nn, val} = props
    if(!listing || listing.length <= 0){
        return <Block></Block>
    }
    const list = listChecker(listing);
    return(
        <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            textInputProps={{fontSize: 21, color:Platform.OS==='ios' ? argonTheme.COLORS.BLACKS:null,}}
            style={{...styles.inputSelect, borderColor:'#999999', fontFamily:'regular',
            inputAndroid: {color:argonTheme.COLORS.BLACKS, fontFamily:'regular',},
            placeholder: {fontSize: 21, color:argonTheme.COLORS.BLACKS, fontFamily:'regular',} }}
            onValueChange={onChange}
            value={val}
            items={list}
            placeholder= {{label: `${nn}`, value:null}}
            Icon={() => {
                return <Ionicons name={Platform.OS==='android' ? "md-arrow-down": "ios-arrow-down"} 
                size={21} style={{color:argonTheme.COLORS.BLACKS}}  />;
            }}    
        />
        // <Block></Block>
    )
};

export const InputText = props => {
    const { onChange, ac, acP, rT, val, lb , tb, label} = props
    return(
        <FInput
            label = {lb}
            value={!val || val==='null' ? '' : val}
            onChangeText={onChange}
            autoCompleteType = {ac || "name"}
            autoCapitalize = {acP || "words"}
            returnKeyType={rT || "next"}
            lcolor={label || '#999999'}
            tb={tb}
            lborders
        />
    )
};

export const ProfileHeader = props => {
    const { fN, lN, dN, img, ePress, press, button } = props
    return(
        <Block row style={{marginTop:10}}>
            {
              !img ? null : 
              <Block flex={0.35} style={{alignItems:'flex-start', marginRight:10}}>
                  <Avatar
                      rounded
                      size='large'
                      source={{
                          uri:
                          `${img}`,
                      }}
                      showEditButton={button}
                      onEditPress={ePress}
                      onPress={press}
                  />
              </Block>
            }
            <Block flex={0.65} style={{justifyContent:'center', alignItems:'flex-start', marginLeft:10}}>
                <Text style={{fontFamily:'bold', fontSize:25, color:argonTheme.COLORS.BLACKS}}>{`${!fN ?null:fN} ${!lN?null:lN}`}</Text>
                <Text style={{fontFamily:'bold', fontSize:14, color:argonTheme.COLORS.BLACKS, }}>{`@${dN}`}</Text>
            </Block>
        </Block>
    )
}

export const AvatarTabs = props => {
    const { img, press } = props;
    return(
        <Block flex={1} style={{backgroundColor:'black'}}>
        <Block style={{marginTop:30}}>
          <TouchableOpacity onPress={press} style={{alignItems:'flex-start', paddingHorizontal:15}}>
              <Block row space='between'>
                  <Ionicons
                      style={{marginRight: 10}}
                      name={Platform.OS === 'android' ? 'md-arrow-back' : 'ios-arrow-back'}
                      size={30}
                      color='#999999'
                  />
                  <Block style={{justifyContent:'center', alignItems:'center'}}>
                    <Text style={{fontFamily:'bold', fontSize: 18, color:'#999999'}}>Back</Text>
                  </Block>
              </Block>
          </TouchableOpacity>
        </Block>
        <Block flex={1} style={{marginTop:20}}>
          <Image
            PlaceholderContent={<ActivityIndicator color='white'  />}
            placeholderStyle={{width:width, height: 342, justifyContent:'center', alignItems:'center'}}
            resizeMode='cover'
            source={{ uri: img }}
            containerStyle={{ width:width, height: 342 }}
          />
        </Block>
      </Block>
    );
}

export const ScheduleDate = props => {
    const { selected, prev } = props
    const currentDate = new Date(moment().format('YYYY-MM-DD'));
    const maxDate = moment().add(180, 'days').format('YYYY-MM-DD');
    return(
        <Block style={{width:'100%', padding: 5, zIndex:100000}}>
            <DatePicker
                style={{width: '100%', marginTop:18, borderColor:'white'}}
                customStyles={{
                dateInput:{color: argonTheme.COLORS.GRADIENT_END},
                placeholderText: {fontSize: 20, color:argonTheme.COLORS.GRADIENT_END, fontFamily:'regular'},
                dateText: {fontSize: 20, color:argonTheme.COLORS.GRADIENT_END, fontFamily:'regular'}
                }}
                date={prev}
                mode="datetime"
                androidMode="spinner"
                placeholder={'Select Date & Time'}
                minDate={currentDate}
                maxDate={maxDate}
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                iconSource={Images.Datepng}
                onDateChange={selected}
            />
        </Block>
    );
}

export const EmptyList = props => (
    <Block flex={1} style={{justifyContent:'center', alignItems:'center'}}>
        <Block middle center style={{marginTop:30}}>
            <MaterialCommunityIcons
                style={{marginRight: 10}}
                name='cancel'
                size={50}
                color='#999999'
            />
            <Text style={{fontFamily:'regular', fontSize:15, color:'#999999'}}>{props.x || "No Item"}</Text>
        </Block>
    </Block>
)

const totalCalculator = (x) => {
    let result = 0.00;
    if(x.length > 0){
        result = x.map(el => {
            const qty = !el.qty ? 0 : parseFloat(el.qty);
            const price = !el.price ? 0 : parseFloat(el.price);
            return ((qty*price));
        })
        result = result.map( el => parseFloat(el)).reduce((a, b) => a + b, 0);
        return result.toFixed(2)
    }
    return result;
}

const shipmentTotal = (x) => {
    let total = 0;
    if(x.length > 0){
        x.map(el => {
            total += !el.shipmentSize ? 0 : el.shipmentSize
        })
    }
    return total.toFixed(2);
}

const totalDiscount = (x) => {
    let result = 0.00;
    if(x.length > 0){
        result = x.map(el => {
            const qty = !el.qty ? 0 : parseFloat(el.qty);
            const price = !el.price ? 0 : parseFloat(el.price);
            const discount = !el.discount ? 0 : parseFloat(el.discount);
            return ((qty*price)*(discount/100));
        })
        result = result.map( el => el).reduce((a, b) => a + b, 0);
        return result.toFixed(2)
    }
    return result;
}

const lineTotal = (x) => {
    let result = 0.00;
    if(x.qty){
        const qty = !x.qty ? 0 : parseFloat(x.qty);
        const price = !x.price ? 0 : parseFloat(x.price);
        const discount = !x.discount ? 0 : parseFloat(x.discount);
        const pri = (qty*price);
        result =((pri) - ((discount/100)*pri));
        return result.toFixed(2)
    }
    return result;
}

const sumTotal = (x,z) => {
    let result = 0.00;
    let orderTotal = totalCalculator(x);
    const sandh = shipmentTotal(x);
    const discount = totalDiscount(x);
    orderTotal = parseFloat(orderTotal)+parseFloat(sandh);
    result = (orderTotal - (parseFloat(discount) + parseFloat(z)));
    return result.toFixed(2);
}

const renderChatListing = (x,y,z) => {
    const { _id, connection } = x.conn;
    const { bizname, displayName, img} = connection;
    const namet = !bizname || bizname==='null' ? displayName : bizname;
    const conn = {_id:connection._id, connID:_id, img, bizname, displayName };
    return(
        <Block flex style={{width:width, paddingHorizontal:5, paddingVertical:5}}>
            <TouchableOpacity onPress={() => y(conn)}>
            <Block flex row>
                <Block flex={0.15} style={{alignItems:'center'}}>
                    <Avatar
                        rounded
                        source={{
                            uri: Odb.dbUrl + img[0]
                        }}
                        size='medium'
                    />
                    
                </Block>
                <Block row flex={0.85} style={{marginLeft:3, borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999'}}>
                    <Block flex={0.85} style={{paddingVertical:3}}>
                        <Block row space='between' style={{marginBottom:2}}>
                            <Block style={{justifyContent:'center'}}><Text style={{fontFamily:'bold', fontSize:14, color:'#000'}}>{`${namet}`}</Text></Block>
                            <Block style={{justifyContent:'center'}}><Text style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>{`${moment(x.updatedAt).subtract(0, 'days').calendar()}`}</Text></Block>
                        </Block>
                        <Block style={{justifyContent:'center'}}>
                            <Text numberOfLines={2} style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>{`${x.text[0].text}`}</Text>
                            {x.status && x.text[0].user._id !== z ? <Block middle style={styles.notify} />:null}
                        </Block>
                    </Block>
                    <Block flex={0.15} style={{justifyContent:'center'}}>
                        <EvilIcons name='chevron-right' size={21} style={{color:'#999999'}}  />
                    </Block>
                </Block>
            </Block>
            </TouchableOpacity>
        </Block>
    )
}

const listingFooter = (x,y,z,a) => {
    const shipping = shipmentTotal(x);
    const tdiscount = totalDiscount(x);
    const odt = totalCalculator(x);
    const total = sumTotal(x,z);

    return(
        <Block style={{width:width-theme.SIZES.BASE*1.5, paddingHorizontal:10,marginTop:20}}>
            <Block style={{alignItems:'flex-end'}}>
                <Block row>
                    <Text style={{fontFamily:'bold', fontSize:14, color:argonTheme.COLORS.GRADIENT_END, marginRight: 10}}>Order Total</Text>
                    <Text style={{fontFamily:'regular', fontSize:14, color:'#000'}}>{`$${odt}`}</Text>
                </Block>
                {
                    shipping > 0 &&
                    <Block row style={{marginTop:10}}>
                        <Text style={{fontFamily:'bold', fontSize:14, color:argonTheme.COLORS.GRADIENT_END, marginRight: 10}}>{`Shipping & Handling Fees`}</Text>
                        <Text style={{fontFamily:'regular', fontSize:14, color:'#000'}}>{`$${shipping}`}</Text>
                    </Block>
                }
                <Block row style={{marginTop:10}}>
                    <Text style={{fontFamily:'bold', fontSize:14, color:argonTheme.COLORS.GRADIENT_END, marginRight: 10}}>Discount</Text>
                    <Text style={{fontFamily:'regular', fontSize:14, color:'#000'}}>{`$${tdiscount}`}</Text>
                </Block>
                <Block row style={{marginTop:10, alignItems:'flex-end'}}>
                    <TouchableOpacity onPress={y}>
                        <Text style={{fontFamily:'bold', fontSize:14, color:argonTheme.COLORS.INFO, marginRight: 10}}>{`Tap & Apply Reward Points`}</Text>
                    </TouchableOpacity>
                    <Text style={{fontFamily:'regular', fontSize:14, color:'#000'}}>{`$${z.toFixed(2)}`}</Text>
                </Block>
            </Block>
            <Block row style={{marginTop:10, paddingVertical:5, alignItems:'flex-end' }}>
                <Block flex={0.4}/>
                <Block flex={0.6} style={{borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:5, alignItems:'flex-end'}}>
                    <Block row style={{alignItems:'flex-end'}}>
                        <Text style={{fontFamily:'bold', fontSize:16, color:argonTheme.COLORS.GRADIENT_END, marginRight: 10}}>Sales Total:</Text>
                        <Text style={{fontFamily:'bold', fontSize:16, color:argonTheme.COLORS.BLACK}}>{`$${total} `}</Text>
                    </Block>
                </Block>
            </Block>
            <Block style={{marginBottom:4,marginTop:20,alignItems:'center', justifyContent:'center' }}>
                <Block style={{ width:width*0.6, }}>
                    <Button
                        title="Pay Now"
                        titleStyle = {{fontFamily:'bold', fontSize: 20, color:argonTheme.COLORS.GRADIENT_END}}
                        type="outline"
                        buttonStyle={{borderColor:argonTheme.COLORS.GRADIENT_END}}
                        raised
                        onPress={() =>a({total:total, shipping:shipping, tdiscount:tdiscount, odt:odt, })}
                        // loading={loading}
                        loadingProps={<ActivityIndicator size="small" color={argonTheme.COLORS.GRADIENT_END} />}
                        icon={
                        <Foundation
                            name='shield'
                            size={28}
                            color={argonTheme.COLORS.GRADIENT_END}
                            style={{marginRight:15}}
                        />
                        }
                    />
                </Block>
            </Block> 
        </Block>
    )
};

const renderRListing = ({item}) =>(
    <ListItem
        leftAvatar={{ source: { uri: Odb.dbUrl + item.for.imageUrl[0] } }}
        title={!item.usage ? `For reviewing order: ...${item.order.substr(14)} `: `Purchases on order: ...${item.order.substr(14)} `}
        titleStyle={{fontFamily:'regular', fontSize:12, color:argonTheme.COLORS.BLACKS}}
        subtitleStyle={{fontFamily:'bold', fontSize:15, color:argonTheme.COLORS.GRADIENT_END}}
        subtitle={item.for.title}
        bottomDivider
        rightElement={
            <Block style={{justifyContent:'center', alignItems:'flex-end'}}>
                <Text style={{fontFamily:'bold', fontSize:16, color:argonTheme.COLORS.GRADIENT_END, marginRight: 10}}>{item.point||item.usage} Pts</Text>
                <Text style={{fontFamily:'regular', fontSize:12, color:argonTheme.COLORS.BLACKS, marginRight: 10}}>{moment(item.updatedAt).format('ll')}</Text>
            </Block>
        }
    />
)

const renderListing = ({item}) => (
    <Block style={{width, paddingHorizontal:10, borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', ...styles.shadow, backgroundColor:'white', marginBottom:10}}>
        <Block row style={{paddingVertical:5, }}>
            <Block flex={0.2}>
                <Image
                    PlaceholderContent={<ActivityIndicator color='white'  />}
                    placeholderStyle={{width:42, height: 42, justifyContent:'center', alignItems:'center'}}
                    resizeMode='cover'
                    source={{ uri: Odb.dbUrl + item.imageUrl[0] }}
                    containerStyle={{ width:62, height: 62, }}
                />
            </Block>
            <Block flex={0.75} style={{marginLeft:-10}}>
                <Block>
                    <Text style={{fontFamily:'bold', fontSize:13, color:argonTheme.COLORS.GRADIENT_END, marginBottom:8}}>{item.title}</Text>
                    <Block row space='between' style={{marginBottom:5}}>
                        <Block row>
                            <Text style={{fontFamily:'bold', fontSize:13, color:'#999999', marginRight:3}}>Qty:</Text>
                            <Text style={{fontFamily:'regular', fontSize:13, color:'#999999'}}>{item.qty}</Text>
                        </Block>
                        <Block row>
                            <Text style={{fontFamily:'bold', fontSize:13, color:'#999999', marginRight:3}}>Price:</Text>
                            <Text style={{fontFamily:'regular', fontSize:13, color:'#999999'}}>{item.price}</Text>
                        </Block>
                        <Block row>
                            <Text style={{fontFamily:'bold', fontSize:13, color:'#999999', marginRight:3}}>Discount:</Text>
                            <Text style={{fontFamily:'regular', fontSize:13, color:'#999999'}}>{item.discount}%</Text>
                        </Block>
                    </Block>
                    <Block style={{borderTopWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:2, alignItems:'flex-end'}}>
                        <Block row >
                            <Text style={{fontFamily:'bold', fontSize:13, color:'#999999', marginRight: 10}}>Line Total</Text>
                            <Text style={{fontFamily:'regular', fontSize:13, color:'#999999'}}>{lineTotal(item)}</Text>
                        </Block>
                    </Block>
                </Block>
            </Block>
        </Block>
    </Block>
)

const listingInput = (x,y,z,a) =>(
    <Block flex={1} style={{paddingHorizontal:15}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
            <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>Shopping Cart</Text>
        </Block>
        <Block flex={1} style={{marginTop:6}}>
            <Block flex={1}>
                <FlatList
                style={{flex: 1}}
                alwaysBounceVertical={true}
                showsVerticalScrollIndicator={false}
                data={x}
                keyExtractor={pp => pp._id}
                ListEmptyComponent={EmptyList}
                ListFooterComponent={x.length <=0 ? null : listingFooter(x,y,z,a)}
                renderItem={renderListing}
                />
            </Block>
        </Block>
    </Block>
);

const rewardComponent = (x,y,z,a,b) =>(
    <Block flex={1} style={{paddingHorizontal:15}}>
        <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4, alignItems:'flex-end'}}>
            <Text style={{fontFamily:'regular', fontSize:18, color:'#999999'}}>{`Available Points: ${!y ? 0.00 : y} `}</Text>
        </Block>
        <Block flex={1} style={{marginTop:6}}>
            <Block flex={1}>
                <FlatList
                    style={{flex: 1}}
                    alwaysBounceVertical={true}
                    extraData={a}
                    showsVerticalScrollIndicator={false}
                    data={x}
                    refreshControl={
                        <RefreshControl
                         refreshing={z}
                         onRefresh={b}
                        />
                      }
                    keyExtractor={pp => pp._id}
                    ListEmptyComponent={<EmptyList x='No Points. Review recent orders and accrue points!'/>}
                    renderItem={renderRListing}
                />
            </Block>
        </Block>
    </Block>
);

const chatComponent = (x,y,z,a,b,c,d,e) =>(
    <Block flex={1} style={{paddingHorizontal:15}}>
        <Block flex={1} style={{marginTop:6}}>
            <Block flex={1}>
                {
                    e && <Block style={{marginTop:50}} />
                }
                <FlatList
                    style={{flex: 1}}
                    alwaysBounceVertical={true}
                    showsVerticalScrollIndicator={false}
                    extraData={b}
                    alwaysBounceVertical={true}
                    showsVerticalScrollIndicator={false}
                    data={!e ? x:d}
                    refreshing={z}
                    onEndReachedThreshold={0.5}
                    onEndReached={a}
                    keyExtractor={pp => pp._id}
                    ListEmptyComponent={<EmptyList x='No conversation'/>}
                    renderItem={({item}) =>renderChatListing(item,y,c)}
                />
            </Block>
        </Block>
    </Block>
);

export const InsideContainer = props => {
    const {cart, close, myList, myReward, reward, rewards, chat, refreshing, extra, loadMore, user, search, switcher } = props
    return(
        <Block flex={1}>
            {
                cart || rewards || chat ? null :
                <Block style={{marginTop:30}}>
                    <TouchableOpacity onPress={close} style={{alignItems:'flex-end', paddingHorizontal:15}}>
                        <Block row space='between'>
                            <Ionicons
                                style={{marginRight: 10}}
                                name={Platform.OS === 'android' ? 'md-close' : 'ios-close'}
                                size={30}
                                color='#999999'
                            />
                            <Block style={{justifyContent:'center', alignItems:'center'}}>
                            <Text style={{fontFamily:'bold', fontSize: 18, color:'#999999'}}>CLOSE</Text>
                            </Block>
                        </Block>
                    </TouchableOpacity>
                </Block>
            }
            <Block flex={1} style={{marginTop:20}}>
                {cart ? listingInput(myList,myReward,reward,extra):null}
                {rewards ? rewardComponent(myList,myReward,refreshing,extra,loadMore):null}
                {chat ? chatComponent(myList, myReward, refreshing, loadMore, extra, user, search, switcher):null}
            </Block>
        </Block>
    );
}

export const AppSearch = props => {
    const { cancel, change, val, placeholder, inner } = props;
    return(
        <SearchBar
            onChangeText={change}
            onClear={cancel}
            onCancel= {cancel}
            showLoading={!val ? false : true}
            color={argonTheme.COLORS.GRADIENT_START}
            value={val}
            lightTheme={true}
            placeholder= {placeholder}
            inputContainerStyle={{...styles.search, width:inner?null:width, height:inner?null:48}}
            inputStyle={{fontFamily:'bold', color:argonTheme.COLORS.GRADIENT_END}}
            showCancel={true}
            cancelButtonTitle='Delete'
        />
    )
}

export const ProfileAlert = props => {
    const { name, on, press } = props;
    return(
        <Overlay isVisible={on}
          overlayBackgroundColor='rgba(244,239,249,0.9)' height='25%'
          onBackdropPress={press}>
            <Block middle flex>
                <Block center middle style={{paddingHorizontal:5}}>
                    <Text style={{fontFamily:'bold', fontSize:15, color:argonTheme.COLORS.GRADIENT_END}}>{`Hello ${name}!`}</Text>
                    <Text style={{fontFamily:'regular', fontSize:12, color:argonTheme.COLORS.HEADER}}>{
                        `Find and connect with friends. Select follower or following to see your options:`}
                    </Text>
                </Block>
                <Block row style={{justifyContent:'center', alignItems:'center', marginTop:15}}>
                    <Block flex={0.3} style={{justifyContent:'center', alignItems:'center'}}>
                        <MaterialCommunityIcons
                        name='account-search'
                        size={26}
                        color={argonTheme.COLORS.GRADIENT_END}
                        />
                    </Block>
                    <Block flex={0.7} style={{justifyContent:'flex-start'}}>
                        <Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.HEADER}}> Search for new connections</Text>
                    </Block>
                </Block>
                <Block row style={{justifyContent:'center', alignItems:'center', marginTop:5, paddingHorizontal:5}}>
                    <Block flex={0.3} style={{justifyContent:'center', alignItems:'center'}}>
                        <MaterialCommunityIcons
                        size={26}
                        name= 'account-switch'
                        color={argonTheme.COLORS.GRADIENT_END}
                        />
                    </Block>
                    <Block flex={0.7} style={{justifyContent:'flex-start'}}>
                        <Text style={{fontFamily:'regular', fontSize:14, color:argonTheme.COLORS.HEADER}}> 
                            Switch between your follower and following
                        </Text>
                    </Block>
                </Block>
            </Block>
        </Overlay>
    )
}
  
const styles = StyleSheet.create({
    shadow: {
      shadowColor: "black",
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 0.2,
      elevation: 4
    },
    search: {
        borderRadius: 0,
        backgroundColor:'rgba(107,36,170,0.1)',
    },
    notify: {
        backgroundColor: argonTheme.COLORS.ACTIVE,
        borderRadius: 5,
        height: 10,
        width: 10,
        position: 'absolute',
        top: 0,
        right: 1,
    },
});
  
