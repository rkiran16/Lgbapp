import React from "react";
import { StyleSheet, FlatList, Alert, Platform, TouchableOpacity, ActivityIndicator} from 'react-native';
import { Button as Btn } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as dash from '../store/actions/dashboard';
import * as orderActions from '../store/actions/orders';
import moment from 'moment';
import { Services } from "../actionable";
import { Ionicons } from '@expo/vector-icons';
import { Block, theme, Text } from 'galio-framework';
import { Card, Overlayer, ScheduleDate, } from '../components';
import { argonTheme } from "../constants";
import { height, width }  from '../constants/utils';



class Saved extends React.Component {
  constructor(){
    super();
    this.state = {
      options:false,
      searches: false,
      searchResult: [],
      selectedItem:null,
      overlay:false,
      selectedDate: null,
      loading: false,
    }
    this.setHeaders = this.setHeaders.bind(this);
    this.fetchSavedItems = this.fetchSavedItems.bind(this);
    this.viewThisItem = this.viewThisItem.bind(this);
  }

  componentWillMount(){
    return this.setHeaders();
  }

  async componentDidMount(){
    await this.fetchSavedItems();
  }

  componentDidUpdate(prevProps){
    if(this.props.savedPost.length !== prevProps.savedPost.length){
      return this.setHeaders();
    }
  }

  fetchSavedItems = async() => {
    try{
      await this.props.dash.fetchSavedItem();
      return this.setHeaders();
    }catch(err){
      return Services.allAlert(Alert,'Error', 'Fetching saved item error', 'Try Again', 'destructive', this.fetchSavedItems, true);
    }
  }

  setHeaders = () =>(
    this.props.navigation.setParams({ 
      navHeaderFunction: this.navHeaderFunction,
      navHeaderSearchLabel: 'Search saved items',
      searchFunction: this.searchSavedItem,
      headerTitle: `Saved Items (${this.manageNumbers(this.props.savedPost.length)})`,
      orderNotifications: this.props.cart.length > 0 ? true:false
    })
  );

  removedSavedItems = async() => {
    this.setState({options:false});
    try{
      await this.props.dash.removedSavedItem(this.state.selectedItem._id);
      return this.setHeaders();
    }catch(err){
      return Services.allAlert(Alert,'Error', 'Removing saved item error', 'Try Again', 'destructive', this.removedSavedItems, true);
    }
  }

  viewThisItem = async() => {
    this.setState({options:false});
    const {category, stype } = this.state.selectedItem.post;
    await this.props.dash.storeView(this.state.selectedItem.post);
    if(!stype || stype === 'Found'){
      await this.props.dash.storedSearches([category]);
      return this.props.navigation.navigate("Categories", {headName:category.name, idToFind:category._id, routeKey:this.props.navigation.state.routeName});
    }else{
      return this.props.navigation.navigate('Product');
    }
  }

  closeOverlayer = () => {
    return this.setState({success:false, overlay:false});
  }

  buyNow = async() => {
    let result;
    this.setState({options:false});
    const { actiontype } = this.state.selectedItem.post;
    if(actiontype && actiontype === 'register'){
      return this.setState({overlay:true});
    }
    await this.props.orderActions.addCartItem(this.state.selectedItem.post, null);
    await this.setHeaders();
    this.setState({success:true, overlay:true, selectedItem:null, selectedDate:null});
  }

  bookingChecker = async() => {
    const { selectedDate, selectedItem} = this.state;
    const { bizname, displayName } = selectedItem.post.creator;
    const namet = !bizname || bizname==='null' ? displayName : bizname;
    if(!selectedDate){
      return this.setState({loading:false});
    }
    try{
      await this.props.dash.confirmSchedule(selectedDate, selectedItem.post.creator._id);
      if(!this.props.scheduling || this.props.scheduling.length <=0){
        await this.props.orderActions.addCartItem(selectedItem.post, selectedDate);
        await this.setHeaders();
        return this.setState({loading:false, success:true, overlay:true, selectedItem:null, selectedDate:null});
      }
      return await this.compareDate();
    }catch(err){
      this.setState({loading:false, overlay:true});
      return Services.allAlert(Alert,'Status', `Error confirming ${namet}'s availability for ${selectedDate}.`, 'Try Again', 'destructive', this.submitBookings, true);
    }
  }
  compareDate = async() => {
    let result;
    const { selectedDate, selectedItem} = this.state;
    const { bizname, displayName } = selectedItem.post.creator;
    const namet = !bizname || bizname==='null' ? displayName : bizname;
    if(!this.props.scheduling){
      return await this.submitBookings()
    }
    result = this.props.scheduling.filter(x => moment(x.date).format('YYYY-MM-DD hh:mm') === moment(selectedDate).format('YYYY-MM-DD hh:mm') || moment(x.date).format('YYYY-MM-DD hh:mm') === moment(selectedDate).add(1,"hours").format('YYYY-MM-DD hh:mm'));
    if(result.length > 0){
      this.setState({loading:false, overlay:true});
      return Services.allAlert(Alert,'Status', `${namet} is already scheduled for ${selectedDate}.`, 'Try Again', 'destructive', null, false);
    }
    await this.props.orderActions.addCartItem(selectedItem.post, selectedDate);
    await this.setHeaders();
    return this.setState({loading:false, success:true, overlay:true, selectedItem:null, selectedDate:null});
  }

  submitBookings = async() => {
    const { selectedItem } = this.state;
    this.setState({overlay:false, loading:true});
    if(!this.props.scheduling || this.props.scheduling.user !== selectedItem.post.creator._id){
      await this.props.dash.removeSchedules();
      return await this.bookingChecker();
    }
    return await this.bookingChecker();
  }

  navHeaderFunction = ()=> {
    return this.props.navigation.navigate('Orders');
  }

  headerPressCancel = () => {
    return this.setState({options:false, selectedItem:null});
  }

  searchSavedItem = data => {
    let result;
    if(data){
      result = this.props.savedPost.filter(el => el.post.title.toLowerCase().includes(data.toLowerCase()));
      return this.setState({searches:true, searchResult: result});
    }  
    if(!data){
      return this.setState({searches: false, searchResult:[]});
    }  
    return;
  }

  manageNumbers = data => {
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

  moreOptions = (x) => {
    return this.setState({options:true, selectedItem:x});
  }

  renderItem=({item}) => (
    <Card item={item} horizontal saved actionFn={() => this.moreOptions(item)}/>
  )

  render() {
    const itemButton = !this.state.selectedItem || !this.state.selectedItem.post.button || this.state.selectedItem.post.button==='null' ? null : this.state.selectedItem.post.button
    return (
      <Block flex>
        <Block flex style={{width:width, alignItems:'center', marginTop: 10}}>
          <FlatList
            extraData={this.props}
            style={{flex:1}}
            alwaysBounceHorizontal={false}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={!this.state.searchResult.length ? this.props.savedPost : this.state.searchResult}
            keyExtractor={pp => pp._id}
            contentContainerStyle={{width: width-theme.SIZES.BASE}}
            renderItem={this.renderItem}
            /> 
        </Block>
        {
          !this.state.options ? null :
          <Block shadow={true} shadowColor='black' center style={{...styles.float,justifyContent: 'flex-end'}}>
            <Block style={{...styles.floatInside, paddingHorizontal: 0, marginBottom: Platform.OS==='android' ? 18 : 18, 
              height: !itemButton ? 140 : 180 }}>
              <Block style={{flex:1}}>
                <TouchableOpacity shadowless style={{flex:0.32}} onPress={this.removedSavedItems}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ERROR}}>Remove Item</Text>
                  </Block>
                </TouchableOpacity>
                <TouchableOpacity shadowless style={{flex:0.37}} onPress={this.viewThisItem}>
                  <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                  borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                    <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>View Item</Text>
                  </Block>
                </TouchableOpacity>
                {
                  !itemButton ?  null : 
                  <TouchableOpacity shadowless style={{flex:0.37}} onPress={this.buyNow}>
                    <Block style={{justifyContent:'center', alignItems:'center', borderBottomWidth: StyleSheet.hairlineWidth, 
                    borderColor:argonTheme.COLORS.GREY, paddingVertical: 10, width:'100%' }}>
                      <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>
                      {itemButton}</Text>
                    </Block>
                  </TouchableOpacity>
                }
                <TouchableOpacity shadowless style={{flex:0.30}} onPress={this.headerPressCancel}>
                  <Block style={{justifyContent:'center', alignItems:'center', paddingVertical: 10 }}>
                  <Text size={16} style={{fontFamily:'regular', color: argonTheme.COLORS.ICON}}>Cancel</Text>
                  </Block>
                </TouchableOpacity>
              </Block>
            </Block>
          </Block>
        }
        {
          this.state.overlay === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
            <Overlayer small btnPress={this.closeOverlayer}>
              {
                this.state.success ?
                <Block flex={1} middle style={{justifyContent:'center', alignItems:'center', borderTopWidth:StyleSheet.hairlineWidth, borderColor:'#999999'}}>
                  <Block style={{justifyContent:'center', alignItems:'center'}}>
                    <Ionicons
                        style={{marginRight: 10}}
                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                        size={56}
                        color= {argonTheme.COLORS.SUCCESS}
                    />
                    <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Item Added to Cart</Text>
                  </Block>
                </Block> :
                <Block style={{paddingHorizontal: 10}}>
                <Block style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4, }}>
                  {
                    this.state.loading ? 
                    <Text style={{fontFamily:'regular', fontSize:18, color:argonTheme.COLORS.GRADIENT_END}}>...confirming schedule</Text> :
                    <Text style={{fontFamily:'regular', fontSize:18, color:'#428bca'}}>Selected item requires scheduling</Text>
                  }
                </Block>
                  <Block style={{width:width, marginTop: 20, paddingHorizontal: 10}}>
                    <ScheduleDate selected={date =>this.setState({selectedDate:date})} prev={this.state.selectedDate}/>
                  </Block>
                  <Block center style={{marginBottom:15,marginTop:20, width: width*0.6, }}>
                    <Btn
                      title={itemButton}
                      titleStyle = {{fontFamily:'bold', fontSize: 20}}
                      type="outline"
                      raised
                      onPress={this.submitBookings}
                      loading={this.state.loading}
                      loadingProps={<ActivityIndicator size="small" color='#428bca' />}
                      icon={
                        <Ionicons
                          name={Platform.OS==='ios'? 'ios-send' : 'md-send'}
                          size={28}
                          color='#428bca'
                          style={{marginRight:15}}
                        />
                      }
                    />
                  </Block> 
                </Block>
              }
            </Overlayer></Block>
        }
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  float: {
    flex: 1, 
    elevation: 5,
    position:'absolute',
    height:height,
    zIndex:20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: width,
    bottom: Platform.OS==='android' ? 1 : 5
  },
  floatInside: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius:4, 
    width:width-theme.SIZES.BASE, 
    zIndex:5, 
    marginBottom: 15, 
    backgroundColor:'#FFF', 
    elevation: 5,
    zIndex:5,
    opacity: 1,
    borderColor: argonTheme.COLORS.GRADIENT_START,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

const mapStateToProps = function(state) {
  return {
    savedPost: state.dashboard.savedPost,
    scheduling: state.dashboard.scheduling,
    cart: state.orders.carts,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    orderActions: bindActionCreators(orderActions, dispatch),
    dash: bindActionCreators(dash, dispatch)
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(Saved);