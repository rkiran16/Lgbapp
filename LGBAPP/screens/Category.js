import React from "react";
import { StyleSheet, Dimensions, FlatList, TouchableOpacity, Platform, Keyboard, KeyboardAvoidingView, RefreshControl } from "react-native";
// Galio components
import { Block, Text, theme } from "galio-framework";
import { SearchBar, ListItem } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import * as dash from '../store/actions/dashboard';
// Argon themed components
import { argonTheme } from "../constants/";
import { Icon, PostItem, Spinner, Overlayer, FInput } from "../components/";
import Tabs from '../components/Tabs';
import { HeaderHeight, height } from "../constants/utils";
import { Odb, Services } from "../actionable";

const { width } = Dimensions.get("screen");
const androidPhone = () => Platform.OS === 'android';
class Category extends React.Component {
  _isMounted = false;
  state={
    submissionType:null,
    submitSuccess:false,
    postComment:null,
    refreshing:false,
    loading: false,
    error: false,
    errorText:null,
    errNum: null,
    overlay: false,
    commentText:'',
    item: null,
    selection: false,
    selectionItem: null,
    filter:false,
    searchText: null,
    tabs: [],
    filterDb: null,
    filterChangeIndex: null
  }

  componentWillMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.props.navigation.setParams({ 
        navHeaderFunction: this.navHeaderFunction,
        navLeftHeaderFunction: this.navLeftHeaderFunction,
      });
    }
  }
  async componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      const { storedSearch } = this.props;
      await this.getNotification();
      this.setState({filterDb:storedSearch}, async() => {
        return await this.setPlaceHolder();
      });
    }
  }

  setPlaceHolder = async() => {
    const { data } = this.state.filterDb;
    const { getParam } = this.props.navigation;
    const tabIndex  = await getParam('idToFind', null);
    const selected  = await getParam('item', null);
    if(!selected){
      this.setState({selection: false, selectionItem: null});
    } else {
      this.setState({selectionItem: selected, selection: true});
    }
    if(data) {
      const tabIndexes = data.find(el => el._id === tabIndex);
      this.setState({filterChangeIndex: !tabIndexes || !tabIndexes.name ? 'Search your item': `Search ${tabIndexes.name}`, loading:true, error:false, errNum:null, errorText:null });
      return await this.postFiltering(1, tabIndex, 0);
    } else {
      return this.setState({filterChangeIndex:'Search your item'});
    }
  }

  async componentDidUpdate(prevProps) {
    this._isMounted = true;
    if (this._isMounted) {
      if (this.props.storedSearch.data !== prevProps.storedSearch.data) {
        console.log('counselly');
        const { storedSearch } = this.props;
        const { state } = this.props.navigation;
        if(!state.params || !state.params.item) {
          this.setState({selection: false, selectionItem: null, filterDb: storedSearch, loading:true, error:false, errNum:null, errorText:null, overlay:false});
        }else {
          this.setState({selectionItem: state.params.item, selection: true, filterDb: storedSearch, loading:true, error:false, errNum:null, errorText:null, overlay:false});
        }
        // this.setState({filterDb: storedSearch, loading:true});
        if(!storedSearch.data[storedSearch.data.length-1]._id) {
          return;
        }
        const { data } = this.props.storedSearch;
        const { pager } = this.props.filteredPost;
        const page = data[data.length-1]._id === this.state.item ? pager : 1;
        return await this.postFiltering(page, data[data.length-1]._id, 1);
      }
    }
    return;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getNotification = async() => {
    const notifications = await Services.checkNotification();
    if(!notifications) {
        return
    }
    return this.props.navigation.setParams({ notifications });
  }

  loadMorePost = async() => {
    if (this._isMounted) {
      const { pager } = this.props.filteredPost;
      const { item } = this.state;
      this.setState({loading: true, error:false, errNum:null, errorText:null});
      return await this.postFiltering(pager, item, 2);
    }
  }

  loadMoreComment = async() => {
    const { pager } = this.props.categoryPostComment;
    const { postComment } = this.state;
    console.log('tolu: ' + postComment);
    this.setState({refreshing:true, error:false, errNum:null, errorText:null });
    try {
      await this.props.showCategoryPostComment(pager, postComment);
      return this.setState({refreshing:false});
    }catch(err) {
      return this.setState({loading:false, error:true, errNum:6, errorText:err})
    }
  }

  navHeaderFunction = ()=> {
    return this.props.navigation.navigate('Notification');
  }

  navLeftHeaderFunction = () => {
    this.setState({filter: !this.state.filter});
  }

  searchFunctions = (data) => {
    if(!data) {
      return;
    }
    if(data) {
      return;
    }
  }

  submitTextComment = async() => {
    const { commentText, portfolioItem } = this.state;
    if(!portfolioItem){
      return;
    }
    try{
        this.setState({error:false, errNum:null, errorText:null, submissionType:null });
        await this.props.submitTextComment(portfolioItem, commentText);
        return this.setState({submitSuccess:true, submissionType:'comment', commentText:'',overlay:false});
    }catch(err) {
        return this.setState({loading:false, error:true, errNum:4, errorText:err});
    }
  }

  savePosting = async(id) => {
    try {
      this.setState({loading:true, error:false, errNum:null, errorText:null, submissionType:null });
      await this.props.savePostingItem(id);
      return this.setState({loading:false, submissionType:'save',submitSuccess:true});
    }catch(err){
      if(err.status === 2){
        return this.setState({loading:false, submissionType:'save',submitSuccess:true});
      }
      return this.setState({loading:false, error:true, errNum:7, errorText:err});
    }
  }

  productSelect = async(item) => {
    await this.props.storeView(item);
    return this.props.navigation.navigate('Product');
  }

  navigateToChat = (cUser) => {
    return this.props.navigation.navigate('Chat', {cUser})
  }

  closeOverlayer = () => {
    return this.setState({overlay:false});
  }

  closeOverlayers = () => {
    return this.setState({submitSuccess:false});
  }

  showOverlayer = async(id) => {
    const { pager,item } = this.props.categoryPostComment;
    const page = item===id ? pager : 1;
    this.setState({overlay:true, portfolioItem:id, refreshing:true, error:false, errNum:null, errorText:null});
    try {
      await this.props.showCategoryPostComment(page, id);
      return this.setState({postComment: id,refreshing:false})
    }catch(err) {
      return this.setState({loading:false, error:true, errNum:5, errorText:err})
    }
  }

  tabClickChanges = async(elm) => {
    const { data } = this.state.filterDb;
    const tabIndexes = data.find(el => el._id === elm);
    this.setState({filterChangeIndex: `Search ${tabIndexes.name}`, loading:true, selectionItem:null, selection:false, error:false, errNum:null}, () =>{
      this.props.navigation.setParams({headerTitle: tabIndexes.name, tabId: elm});
    })
    if(elm){
      return await this.postFiltering(1, elm, 3);
    }
    return;
  }

  postFiltering = async(pager, elm, errNm) => {
    try {
      await this.props.filterPosts(pager, elm);
      if (this._isMounted) {
        return this.setState({loading:false, item:elm});
      }
      return;
    } catch(error) {
      return this.setState({error:true, loading:false, errNum:errNm, errorText:error});
    }
  }

  commentListing = ({item}) => (
    <ListItem
      leftAvatar={{ source: { uri: Odb.dbUrl + item.user.img[0] } }}
      title={item.user.displayName}
      titleStyle={{fontFamily:'bold', fontSize:15}}
      subtitle={item.text}
      subtitleStyle={{fontFamily:'regular', fontSize:12, color:'#999999'}}
      // bottomDivider
    />
  );

  renderNavigation = () => {
    const { data } = this.state.filterDb;
    const { getParam } = this.props.navigation;
    const tabIndex  = getParam('idToFind', null);
    return (
      <Block flex style={{...styles.group, height:120, position:'absolute', marginTop:0, 
      Top:HeaderHeight, zIndex: 9000, borderBottomWidth: !data.length ? 0 : StyleSheet.hairlineWidth}}>
        <Block style={{ marginBottom: theme.SIZES.BASE }}>
          <SearchBar
              onChangeText={value => this.setState({searchText:value.replace(/[^a-z,A-Z,0-9]/g,'')})}
              onClear={() => this.setState({searchText:null})}
              onCancel= {() => this.setState({searchText:null})}
              showLoading={!this.state.searchText ? false : true}
              color={argonTheme.COLORS.GRADIENT_START}
              value={this.state.searchText}
              lightTheme={true}
              placeholder= {this.state.filterChangeIndex}
              inputContainerStyle={styles.search}
              showCancel={true}
              cancelButtonTitle='Delete'
            />
            {
              !data.length ? null :
              <Tabs
                data={data || []}
                initialIndex={tabIndex || 0}
                onChange={_id => this.tabClickChanges(_id)} />
            }
        </Block>
      </Block>
    );
  };

  renderCat= ({item}) => {
    return (
      <Block flex style={{width:width, justifyContent:'flex-start', alignItems:'flex-start'}}>
        <Block style={{  }}>
          <PostItem item={item} onSelects={() => this.productSelect(item)} iSave={() =>this.savePosting(item._id)}
          iComment={()=>this.showOverlayer(item._id)}  chatting={() => this.navigateToChat(item.creator)} />
        </Block>
      </Block>
    );
  };

  renderFlatListHeader = () => <PostItem item={this.state.selectionItem} onSelects={() => this.productSelect(this.state.selectionItem)} 
                          chatting={() => this.navigateToChat(this.state.selectionItem.creator)} iSave={() =>this.savePosting(item._id)}
                          iComment={()=>this.showOverlayer(item._id)} />

  emptyList = () => (
    <Block style={{justifyContent:'center', alignItems:'center'}}>
      <Text style={{fontFamily:'regular', color:argonTheme.COLORS.GRADIENT_END}}>No Item found</Text>
    </Block>
  );

  render() {
    return (
      <Block flex center>
        {this.state.filter ? this.renderNavigation(): null}
        <FlatList
          style={{flex: 1}}
          alwaysBounceVertical={true}
          showsVerticalScrollIndicator={false}
          extraData={this.props.filteredPost}
          data={this.props.filteredPost.data}
          initialNumToRender={3}
          keyExtractor={pp => pp._id}
          ListEmptyComponent={this.emptyList}
          ListHeaderComponent={!this.state.selection ? null : this.renderFlatListHeader}
          refreshing={this.state.loading}
          onEndReachedThreshold={0.1}
          onEndReached={this.loadMorePost}
          removeClippedSubviews
          renderItem={this.renderCat}
        />
        <Block center row style={{position: 'absolute', bottom: 10, right:5}}>
            <TouchableOpacity shadowless={true} onPress={() => this.props.navigation.navigate('MapSearch', {routeKey:this.props.navigation.state.routeName})}
                style={{height:60,width:60,borderRadius:30, backgroundColor:argonTheme.COLORS.GRADIENT_END, alignItems:'center',overflow:"hidden" }}>
                <Block style={{height:60,width:60,borderRadius:30, alignItems:'center', justifyContent:'center'}}>
                    <Icon
                    name={Platform.OS==='android'? 'md-map' : 'ios-map'}
                    family='Ionicon'
                    size={40}
                    color={argonTheme.COLORS.INFO}
                    />
                </Block>
            </TouchableOpacity>
        </Block>
        {
          this.state.loading===true ? <Block center style={{ position:'absolute', bottom:height<=720?20:30, zIndex:1000 }}><Spinner color={argonTheme.COLORS.GRADIENT_END} label='Loading...' /></Block>:null
        }
        {
          this.state.overlay === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
              <Overlayer medium btnPress={this.closeOverlayer}>
                  <KeyboardAvoidingView behavior='padding' style={{flex:1}} keyboardVerticalOffset={Platform.OS==='ios'? HeaderHeight*4.2:HeaderHeight*3.6}>
                      <Block space='between' style={{padding:10, flex:1}} >
                          <Block style={{flex:0.95}} onPress={Keyboard.dismiss}>
                              <Block row space='between' style={{ borderBottomWidth:StyleSheet.hairlineWidth, borderColor:'#999999', paddingVertical:4}}>
                                  <Text style={{fontFamily:'regular', fontSize:14, color:'#999999'}}>Comments</Text>
                                  {this.state.error ? <Text style={{fontFamily:'regular', fontSize:14, color:'red'}}>{`${this.state.errorText}`}</Text> : null}
                              </Block>
                              <Block flex={1} style={{ marginTop:2, }}>
                                <FlatList
                                  ListEmptyComponent={this.emptyList}
                                  extraData={this.props.categoryPostComment}
                                  data={this.props.categoryPostComment.data}
                                  style={{flex: 1}}
                                  showsVerticalScrollIndicator={false}
                                  alwaysBounceVertical={true}
                                  refreshControl={
                                    <RefreshControl
                                     refreshing={this.state.refreshing}
                                     onRefresh={this.loadMoreComment}
                                    />
                                  }
                                  removeClippedSubviews
                                  keyExtractor= {p => p._id}
                                  renderItem = {this.commentListing}
                                />
                            </Block>
                          </Block>
                      </Block>
                      <Block row space='between' style={{borderWidth:1, borderColor: argonTheme.COLORS.GRADIENT_END, padding:15, borderRadius:20, marginHorizontal:10, zIndex:1000 }}>
                          <Block flex={0.8}>
                              <FInput
                                  lcolor={argonTheme.COLORS.GRADIENT_START}
                                  lfont={18}
                                  label = 'Enter comment here...'
                                  small
                                  noBorder
                                  multiline
                                  value={this.state.commentText}
                                  onChangeText={text =>  this.setState({commentText:text})}
                                  autoCapitalize = "sentences"
                                  returnKeyType= {Platform.OS==='ios'?'next':'none'}
                                  style={{fontSize: 18, fontFamily:'regular', color: argonTheme.COLORS.GRADIENT_START,height: !this.state.commentText ? 30 : !this.state.commentText.length > 30 ? 40 : this.state.commentText.length > 60 ? 55 : 80}}
                              />
                          </Block>
                          <Block style={{height:'auto', alignItems:'center', justifyContent:'center'}} flex={0.2}>
                              <TouchableOpacity style={{padding:5}} onPress={this.submitTextComment}>
                                  <Block style={{ padding: 5, backgroundColor:Platform.OS==='android'? argonTheme.COLORS.GRADIENT_END:'transparent'}}>
                                      <Text style={{fontSize:12, fontFamily:'regular', 
                                      color: Platform.OS==='android' ? 'white' : argonTheme.COLORS.GRADIENT_END}}>SUBMIT</Text>
                                  </Block>
                              </TouchableOpacity>
                          </Block>
                      </Block>
                  </KeyboardAvoidingView>
              </Overlayer>
          </Block>
        }
        {
          this.state.submitSuccess === false ? null : <Block style={{position:'absolute', bottom:0, flex:1, zIndex:97000}}>
            <Overlayer smaller btnPress={this.closeOverlayers}>
              {
                this.state.submissionType === 'comment' ?
                <Block flex={1} middle style={{ marginTop:-20}}>
                    <Ionicons
                        style={{marginRight: 10}}
                        name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                        size={56}
                        color= {argonTheme.COLORS.SUCCESS}
                    />
                    <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Comment submitted!</Text>
                </Block> :
                <Block flex={1} middle style={{ marginTop:-25}}>
                  <Ionicons
                    style={{marginRight: 10}}
                    name={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'}
                    size={56}
                    color= {argonTheme.COLORS.SUCCESS}
                  />
                  <Text fontSize={28} color={argonTheme.COLORS.SUCCESS} style={{fontFamily:'bold'}}>Saved!</Text>
                </Block>
              }
            </Overlayer></Block>
        }
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    paddingBottom: theme.SIZES.BASE,
    paddingHorizontal: theme.SIZES.BASE * 2,
    marginTop: 44,
    color: argonTheme.COLORS.HEADER
  },
  group: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: argonTheme.COLORS.GREY,
    marginBottom: theme.SIZES.BASE/4,
    marginTop: theme.SIZES.BASE,
    width: width
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
    width:width,
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
    width: width - (theme.SIZES.BASE*1.5)
  },
  search: {
    height: 48,
    //width: width,
    borderRadius: 0,
    backgroundColor:'rgba(107,36,170,0.1)',
  },
});



const mapStateToProps = function(state) {
  return {
    rKat: state.dashboard.category,
    tags: state.dashboard.tags,
    storedSearch: state.dashboard.storedSearch,
    filteredPost: state.dashboard.filteredPost,
    categoryPostComment: state.dashboard.categoryPostComment,
    //loggedIn: state.auth.loggedIn
  }
}
export default connect(mapStateToProps,dash)(Category);